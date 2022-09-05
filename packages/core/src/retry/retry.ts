import { combine, createEvent, createStore, Event, sample } from 'effector';
import { delay } from 'patronum';

import {
  normalizeSourced,
  normalizeStaticOrReactive,
  reduceTwoArgs,
  SourcedField,
  StaticOrReactive,
  TwoArgsDynamicallySourcedField,
} from '../misc/sourced';
import { Query, QueryError, QueryParams } from '../query/type';
import { RetryMeta } from './type';

type FailInfo<Q extends Query<any, any, any>> = {
  params: QueryParams<Q>;
  error: QueryError<Q>;
};

function retry<
  Q extends Query<any, any, any>,
  DelaySource = unknown,
  FilterSource = unknown,
  MapParamsSource = unknown
>({
  query,
  times,
  delay: timeout,
  filter,
  mapParams,
}: {
  query: Q;
  times: StaticOrReactive<number>;
  delay: SourcedField<RetryMeta, number, DelaySource>;
  filter?: SourcedField<FailInfo<Q>, boolean, FilterSource>;
  mapParams?: TwoArgsDynamicallySourcedField<
    FailInfo<Q>,
    RetryMeta,
    QueryParams<Q>,
    MapParamsSource
  >;
}): void {
  const $maxAttempts = normalizeStaticOrReactive(times);
  const $attempt = createStore(1, {
    serialize: 'ignore',
  });

  const $meta = combine({
    attempt: $attempt,
  });

  const newAttempt = createEvent();
  const planNextAttempt = createEvent<
    FailInfo<Q> & {
      meta: RetryMeta;
    }
  >();

  sample({
    clock: query.finished.failure,
    source: {
      maxAttempts: $maxAttempts,
      attempt: $attempt,
      shouldPlanRetry: normalizeSourced({
        field: filter ?? true,
        clock: query.finished.failure,
      }),
    },
    filter: ({ maxAttempts, attempt, shouldPlanRetry }) =>
      shouldPlanRetry && attempt <= maxAttempts,
    fn: ({ attempt }, { params, error }) => ({
      params,
      error,
      meta: { attempt },
    }),
    target: planNextAttempt,
  });

  sample({
    clock: delay({
      source: sample({
        clock: planNextAttempt,
        source: normalizeSourced(
          reduceTwoArgs({
            field: mapParams ?? (({ params }: FailInfo<Q>) => params),
            clock: planNextAttempt.map(({ params, error, meta }) => [
              { params, error },
              meta,
            ]),
          })
        ),
      }) as Event<any>, // TODO: why types is not inferred correctly?
      timeout: normalizeSourced({
        field: timeout,
        source: $meta,
      }),
    }),
    target: [newAttempt, query.start],
  });

  $attempt
    .on(newAttempt, (attempt) => attempt + 1)
    .reset(query.finished.success);
}

export { retry };
