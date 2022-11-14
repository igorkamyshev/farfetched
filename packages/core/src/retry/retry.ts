import {
  combine,
  createEvent,
  createStore,
  Event,
  sample,
  split,
} from 'effector';
import { delay } from 'patronum';

import { Time, parseTime } from '../misc/time';
import { deprecationWarning } from '../deprectaion/warning';

import {
  normalizeSourced,
  normalizeStaticOrReactive,
  reduceTwoArgs,
  SourcedField,
  StaticOrReactive,
  TwoArgsDynamicallySourcedField,
} from '../misc/sourced';
import { isQuery, Query } from '../query/type';
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
  mapParams?: TwoArgsDynamicallySourcedField<
    FailInfo<Q>,
    RetryMeta,
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
  config: RetryConfig<Q, DelaySource, FilterSource, MapParamsSource>
): void;

/**
 * @deprecated since v0.3.0
 *
 * use retry(query, config) instead
 */
export function retry<
  Q extends Query<any, any, any>,
  DelaySource = unknown,
  FilterSource = unknown,
  MapParamsSource = unknown
>(
  config: {
    query: Q;
  } & RetryConfig<Q, DelaySource, FilterSource, MapParamsSource>
): void;

export function retry(operationOrConfig: any, maybeConfig?: any): void {
  const {
    operation,
    times,
    delay: timeout,
    filter,
    mapParams,
    otherwise,
  } = parseRetryConfig(operationOrConfig, maybeConfig);

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
        field: filter ?? true,
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
      source: sample({
        clock: planNextAttempt,
        source: normalizeSourced(
          reduceTwoArgs({
            field: mapParams ?? (({ params }) => params),
            clock: planNextAttempt.map(({ params, error, meta }) => [
              { params, error },
              meta,
            ]),
          })
        ),
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

function parseRetryConfig<
  Q extends RemoteOperation<any, any, any, any>,
  DelaySource = unknown,
  FilterSource = unknown,
  MapParamsSource = unknown
>(
  operationOrConfig: any,
  maybeConfig: any
): RetryConfig<Q, DelaySource, FilterSource, MapParamsSource> & {
  operation: Q;
} {
  if (isQuery(operationOrConfig.query)) {
    deprecationWarning(
      'retry({ query, /* ... */ }) is deprecated',
      'use retry(query, { /* ... */ }) instead'
    );
    const { query, ...restConfig } = operationOrConfig;

    return { ...restConfig, operation: query };
  }

  return { ...maybeConfig, operation: operationOrConfig };
}
