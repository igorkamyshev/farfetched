import {
  combine,
  createEvent,
  createStore,
  Event,
  sample,
  split,
} from 'effector';
import { delay } from 'patronum';

import {
  normalizeSourced,
  normalizeStaticOrReactive,
  reduceTwoArgs,
  SourcedField,
  StaticOrReactive,
  TwoArgsDynamicallySourcedField,
} from '../misc/sourced';
import { Query } from '../query/type';
import {
  RemoteOperationError,
  RemoteOperationParams,
} from '../remote_operation/type';
import { RetryMeta } from './type';

type FailInfo<Q extends Query<any, any, any>> = {
  params: RemoteOperationParams<Q>;
  error: RemoteOperationError<Q>;
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
  otherwise,
}: {
  query: Q;
  times: StaticOrReactive<number>;
  delay: SourcedField<RetryMeta, number, DelaySource>;
  filter?: SourcedField<FailInfo<Q>, boolean, FilterSource>;
  mapParams?: TwoArgsDynamicallySourcedField<
    FailInfo<Q>,
    RetryMeta,
    RemoteOperationParams<Q>,
    MapParamsSource
  >;
  otherwise?: Event<FailInfo<Q>>;
}): void {
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
      clock: query.finished.failure,
      source: {
        maxAttempts: $maxAttempts,
        attempt: $attempt,
      },
      filter: normalizeSourced({
        field: filter ?? true,
        clock: query.finished.failure,
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

  if (otherwise) {
    sample({ clock: retriesAreOver, target: otherwise });
  }
}

export { retry };
