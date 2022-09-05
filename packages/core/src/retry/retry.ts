import { combine, createEvent, createStore, Event, sample } from 'effector';
import { delay } from 'patronum';

import { identity } from '../misc/identity';
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
  filter?: SourcedField<QueryError<Q>, boolean, FilterSource>;
  mapParams?: TwoArgsDynamicallySourcedField<
    QueryParams<Q>,
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
  const planNextAttempt = createEvent<{
    params: QueryParams<Q>;
    meta: RetryMeta;
  }>();

  sample({
    clock: query.finished.failure,
    source: {
      maxAttempts: $maxAttempts,
      attempt: $attempt,
      shouldPlanRetry: normalizeSourced({
        field: filter ?? true,
        clock: query.finished.failure.map(({ error }) => error),
      }),
    },
    filter: ({ maxAttempts, attempt, shouldPlanRetry }) =>
      shouldPlanRetry && attempt <= maxAttempts,
    fn: ({ attempt }, { params }) => ({ params, meta: { attempt } }),
    target: planNextAttempt,
  });

  sample({
    clock: delay({
      source: sample({
        clock: planNextAttempt,
        source: normalizeSourced(
          reduceTwoArgs({
            field: mapParams ?? identity<QueryParams<Q>>,
            clock: {
              data: planNextAttempt.map(({ params }) => params),
              params: planNextAttempt.map(({ meta }) => meta),
            },
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
