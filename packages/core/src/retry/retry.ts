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
import { Query, QueryParams } from '../query/type';

interface RetryMeta {
  attempt: number;
}

// TODO: add filter option
function retry<
  Q extends Query<any, any, any>,
  DelaySource = unknown,
  MapParamsSource = unknown
>({
  times,
  query,
  delay: timeout,
  mapParams,
}: {
  query: Q;
  times: StaticOrReactive<number>;
  delay: SourcedField<RetryMeta, number, DelaySource>;
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

  $attempt.on(newAttempt, (attempt) => attempt + 1);

  sample({
    clock: query.finished.failure,
    source: { maxAttempts: $maxAttempts, attempt: $attempt },
    filter: ({ maxAttempts, attempt }) => attempt <= maxAttempts,
    fn: ({ attempt }, { params }) => ({ params, meta: { attempt } }),
    target: planNextAttempt,
  });

  // TODO: why types is not inferred correctly?
  const nextAttemptWithNewParams: Event<any> = sample({
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
  });

  sample({
    clock: delay({
      source: nextAttemptWithNewParams,
      timeout: normalizeSourced({
        field: timeout,
        source: $meta,
      }),
    }),
    target: [newAttempt, query.start],
  });

  $attempt.reset(query.finished.success);
}

export { retry };
