import {
  combine,
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
  type Event,
  type EffectError,
  type EffectParams,
  type EffectResult,
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

type FailInfo<Q extends RemoteOperation<any, any, any, any>> = {
  params: RemoteOperationParams<Q>;
  error: RemoteOperationError<Q>;
};

type RetryConfig<
  Q extends RemoteOperation<any, any, any, any>,
  DelaySource = unknown,
  FilterSource = unknown,
  MapParamsSource = unknown
> =
  | {
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
  | {
      times: StaticOrReactive<number>;
      delay: SourcedField<RetryMeta, Time, DelaySource>;
      filter?: SourcedField<FailInfo<Q>, boolean, FilterSource>;
      mapParams?: DynamicallySourcedField<
        FailInfo<Q> & { meta: RetryMeta },
        RemoteOperationParams<Q>,
        MapParamsSource
      >;
      supressIntermidiateErrors: true;
    };

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
    ...params
  }: RetryConfig<Q, DelaySource, FilterSource, MapParamsSource>
): void {
  const $maxAttempts = normalizeStaticOrReactive(times);
  const $attempt = createStore(1, {
    serialize: 'ignore',
  });

  const $meta = combine({
    attempt: $attempt,
  });

  const failed = createEvent<{
    params: RemoteOperationParams<Q>;
    error: RemoteOperationError<Q>;
  }>();

  const newAttempt = createEvent();

  const { planNextAttempt, __: retriesAreOver } = split(
    sample({
      clock: failed,
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
      timeout: normalizeSourced({
        field: timeout,
        source: $meta,
      }).map(parseTime),
    }),
    fn: (params) => ({
      params,
      meta: { stopErrorPropagation: false, stale: true },
    }),
    target: [newAttempt, operation.__.lowLevelAPI.startWithMeta],
  });

  $attempt
    .on(newAttempt, (attempt) => attempt + 1)
    .reset([operation.finished.success, operation.start]);

  if ('otherwise' in params && params.otherwise) {
    sample({ clock: retriesAreOver, target: params.otherwise });
  }

  if (
    'supressIntermidiateErrors' in params &&
    params.supressIntermidiateErrors
  ) {
    operation.__.lowLevelAPI.dataSources =
      operation.__.lowLevelAPI.dataSources.map((dataSource) => ({
        ...dataSource,
        get: createEffect<
          EffectParams<typeof dataSource.get>,
          EffectResult<typeof dataSource.get>,
          EffectError<typeof dataSource.get>
        >(async (opts: { params: RemoteOperationParams<Q> }) => {
          try {
            const result = await dataSource.get(opts);

            return result;
          } catch (error) {
            failed({ params: opts.params, error });

            return null;
          }
        }),
      }));
  } else {
    sample({ clock: operation.finished.failure, target: failed });
  }
}
