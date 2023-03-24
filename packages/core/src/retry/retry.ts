import {
  type Event,
  withRegion,
  combine,
  createEvent,
  createStore,
  sample,
  split,
} from 'effector';

import {
  delay,
  normalizeSourced,
  normalizeStaticOrReactive,
  type DynamicallySourcedField,
  type SourcedField,
  type StaticOrReactive,
} from '../libs/patronus';
import { type Time, parseTime } from '../libs/date-nfs';

import {
  type RemoteOperation,
  type RemoteOperationError,
  type RemoteOperationParams,
} from '../remote_operation/type';
import { type RetryMeta } from './type';
import { createMetaNode } from '../inspect/node';

type FailInfo<Q extends RemoteOperation<any, any, any, any>> = {
  params: RemoteOperationParams<Q>;
  error: RemoteOperationError<Q>;
};

interface RetryConfig<
  Q extends RemoteOperation<any, any, any, any>,
  DelaySource = unknown,
  FilterSource = unknown,
  MapParamsSource = unknown
> {
  times: StaticOrReactive<number>;
  delay: SourcedField<RetryMeta, Time, DelaySource>;
  filter?: SourcedField<FailInfo<Q>, boolean, FilterSource>;
  mapParams?: DynamicallySourcedField<
    FailInfo<Q> & { meta: RetryMeta },
    RemoteOperationParams<Q>,
    MapParamsSource
  >;
  otherwise?: Event<FailInfo<Q>>;
}

export function retry<
  Q extends RemoteOperation<any, any, any, any>,
  DelaySource = unknown,
  FilterSource = unknown,
  MapParamsSource = unknown
>(
  operation: Q,
  {
    times,
    delay: timeout,
    filter,
    mapParams,
    otherwise,
  }: RetryConfig<Q, DelaySource, FilterSource, MapParamsSource>
): void {
  return withRegion(
    createMetaNode({
      type: 'operator',
      operator: 'retry',
      target: operation.__.meta.node,
    }),
    () => {
      const $maxAttempts = withRegion(createMetaNode({ name: 'times' }), () =>
        normalizeStaticOrReactive(times)
      );
      const $attempt = withRegion(createMetaNode({ name: 'attempt' }), () =>
        createStore(1, {
          serialize: 'ignore',
        })
      );

      const $meta = combine({
        attempt: $attempt,
      });

      const $timeout = withRegion(createMetaNode({ name: 'timeout' }), () =>
        normalizeSourced({
          field: timeout,
          source: $meta,
        }).map(parseTime)
      );

      const newAttempt = createEvent();

      const { planNextAttempt, __: retriesAreOver } = split(
        sample({
          clock: operation.finished.failure,
          source: {
            maxAttempts: $maxAttempts,
            attempt: $attempt,
          },
          filter: normalizeSourced({
            field: (filter ?? true) as any,
            clock: operation.finished.failure,
          }),
          fn: ({ attempt, maxAttempts }, { params, error }) => ({
            params,
            error,
            meta: { attempt, maxAttempts },
          }),
        }),
        { planNextAttempt: ({ meta }) => meta.attempt <= meta.maxAttempts }
      );

      sample({
        clock: delay({
          clock: sample({
            clock: planNextAttempt,
            source: normalizeSourced({
              field: (mapParams ?? (({ params }: any) => params)) as any,
              clock: planNextAttempt,
            }),
          }),
          timeout: $timeout,
        }),
        target: [newAttempt, operation.start],
      });

      $attempt
        .on(newAttempt, (attempt) => attempt + 1)
        .reset(operation.finished.success);

      if (otherwise) {
        sample({ clock: retriesAreOver, target: otherwise });
      }
    }
  );
}
