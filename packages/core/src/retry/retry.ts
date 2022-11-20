import {
  combine,
  createEvent,
  createStore,
  Event,
  sample,
  split,
} from 'effector';

import { delay } from '../libs/patronus/delay';
import { Time, parseTime } from '../misc/time';

import {
  DynamicallySourcedField,
  normalizeSourced,
  normalizeStaticOrReactive,
  SourcedField,
  StaticOrReactive,
} from '../misc/sourced';
import {
  RemoteOperation,
  RemoteOperationError,
  RemoteOperationParams,
} from '../remote_operation/type';
import { RetryMeta } from './type';

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
  const $maxAttempts = normalizeStaticOrReactive(times);
  const $attempt = createStore(1, {
    serialize: 'ignore',
  });

  const $meta = combine({
    attempt: $attempt,
  });

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
          clock: planNextAttempt.map(({ params, error, meta }) => ({
            params,
            error,
            meta,
          })),
        }),
      }),
      timeout: normalizeSourced({
        field: timeout,
        source: $meta,
      }).map(parseTime),
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
