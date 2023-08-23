import {
  combine,
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
  attach,
  scopeBind,
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
  type StaticOrReactive,
} from '../libs/patronus';
import { type Time, parseTime } from '../libs/date-nfs';

import {
  type ExecutionMeta,
  type RemoteOperation,
  type RemoteOperationError,
  type RemoteOperationParams,
} from '../remote_operation/type';
import { type RetryMeta } from './type';
import { type PartialStore } from '../libs/patronus/sourced_future';

type FailInfo<Q extends RemoteOperation<any, any, any, any>> = {
  params: RemoteOperationParams<Q>;
  error: RemoteOperationError<Q>;
  meta: ExecutionMeta;
};

type RetryConfig<
  Q extends RemoteOperation<any, any, any, any>,
  MapParamsSource = unknown
> = {
  times: StaticOrReactive<number>;
  delay: PartialStore<RetryMeta, Time>;
  filter?: PartialStore<FailInfo<Q>, boolean>;
  mapParams?: DynamicallySourcedField<
    FailInfo<Q> & { meta: RetryMeta },
    RemoteOperationParams<Q>,
    MapParamsSource
  >;
  otherwise?: Event<FailInfo<Q>>;
  supressIntermediateErrors?: boolean;
};

export function retry<
  Q extends RemoteOperation<any, any, any, any>,
  MapParamsSource = unknown
>(
  operation: Q,
  {
    times,
    delay: timeout,
    filter,
    mapParams,
    ...params
  }: RetryConfig<Q, MapParamsSource>
): void {
  const supressIntermediateErrors = params.supressIntermediateErrors ?? false;

  const $maxAttempts = normalizeStaticOrReactive(times);
  const $attempt = createStore(1, {
    serialize: 'ignore',
  });

  const $meta = combine({
    attempt: $attempt,
  });

  const $supressError = combine(
    $attempt,
    $maxAttempts,
    (attempt, maxAttempts) =>
      supressIntermediateErrors && attempt <= maxAttempts
  );

  const failed = createEvent<{
    params: RemoteOperationParams<Q>;
    error: RemoteOperationError<Q>;
    meta: ExecutionMeta;
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
        clock: failed,
      }),
      fn: ({ attempt, maxAttempts }, { params, error, meta }) => ({
        params,
        error,
        meta: { ...meta, attempt, maxAttempts },
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

  if (params.otherwise) {
    sample({ clock: retriesAreOver, target: params.otherwise });
  }

  if (supressIntermediateErrors) {
    const originalFx =
      operation.__.lowLevelAPI.dataSourceRetrieverFx.use.getCurrent();

    operation.__.lowLevelAPI.dataSourceRetrieverFx.use(
      attach({
        source: $supressError,
        mapParams: (opts, supressError) => ({ ...opts, supressError }),
        effect: createEffect<
          EffectParams<
            typeof operation.__.lowLevelAPI.dataSourceRetrieverFx
          > & { supressError: boolean },
          EffectResult<typeof operation.__.lowLevelAPI.dataSourceRetrieverFx>,
          EffectError<typeof operation.__.lowLevelAPI.dataSourceRetrieverFx>
        >(async ({ supressError, ...opts }) => {
          const boundFailed = scopeBind(failed, { safe: true });
          try {
            const result = await originalFx(opts);

            return result;
          } catch (error: any) {
            if (supressError) {
              boundFailed({
                params: opts.params,
                error: error.error,
                meta: opts.meta,
              });

              throw { error: error.error, stopErrorPropagation: true };
            } else {
              throw error;
            }
          }
        }),
      })
    );
  }

  sample({ clock: operation.finished.failure, target: failed });
}
