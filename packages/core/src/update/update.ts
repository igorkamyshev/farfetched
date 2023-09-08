import {
  combine,
  createEvent,
  merge,
  sample,
  split,
  type Store,
} from 'effector';

import { isNotEmpty } from '../libs/lohyphen';
import {
  type DynamicallySourcedField,
  normalizeSourced,
} from '../libs/patronus';
import { type Mutation } from '../mutation/type';
import { type Query } from '../query/type';
import {
  type RemoteOperationError,
  type RemoteOperationParams,
  type RemoteOperationResult,
} from '../remote_operation/type';

type QueryState<Q extends Query<any, any, any, any>> =
  | {
      result: RemoteOperationResult<Q>;
      params: RemoteOperationParams<Q>;
    }
  | {
      error: RemoteOperationError<Q>;
      params: RemoteOperationParams<Q>;
    }
  | null;

type Refetch<Q extends Query<any, any, any, any>> =
  | boolean
  | { params: RemoteOperationParams<Q> };

type RuleResult<Q extends Query<any, any, any, any>> =
  | {
      result: RemoteOperationResult<Q>;
      refetch?: Refetch<Q>;
    }
  | {
      error: RemoteOperationError<Q>;
      refetch?: Refetch<Q>;
    };

export function update<
  Q extends Query<any, any, any, any>,
  M extends Mutation<any, any, any>
>(
  query: Q,
  {
    on: mutation,
    by: rules,
  }: {
    on: M;
    by: {
      success: DynamicallySourcedField<
        {
          query: QueryState<Q>;
          mutation: {
            result: RemoteOperationResult<M>;
            params: RemoteOperationParams<M>;
          };
        },
        RuleResult<Q>
      >;
      failure?: DynamicallySourcedField<
        {
          query: QueryState<Q>;
          mutation: {
            error: RemoteOperationError<M>;
            params: RemoteOperationParams<M>;
          };
        },
        RuleResult<Q>
      >;
    };
  }
): void {
  const $queryState = queryState(query);

  const fillQueryData = createEvent<{
    result: RemoteOperationResult<Q>;
    refetch?: Refetch<Q>;
  }>();
  const fillQueryError = createEvent<{
    error: RemoteOperationError<Q>;
    refetch?: Refetch<Q>;
  }>();

  split({
    source: sample({
      clock: mutation.finished.success,
      source: normalizeSourced({
        field: rules.success,
        clock: sample({
          clock: mutation.finished.success,
          source: $queryState,
          fn: (query, { result, params }) => ({
            query,
            mutation: { result, params: params ?? null },
          }),
        }),
      }),
    }),
    match: {
      fillData: (payload: any) => isNotEmpty(payload.result),
    },
    cases: { fillData: fillQueryData, __: fillQueryError },
  });

  if (rules.failure) {
    split({
      source: sample({
        clock: mutation.finished.failure,
        source: normalizeSourced({
          field: rules.failure,
          clock: sample({
            clock: mutation.finished.failure,
            source: $queryState,
            fn: (query, { error, params }) => ({
              query,
              mutation: { error, params: params ?? null },
            }),
          }),
        }),
      }),
      match: {
        fillData: (payload: any) => isNotEmpty(payload.result),
      },
      cases: { fillData: fillQueryData, __: fillQueryError },
    });
  }

  sample({
    clock: fillQueryData,
    fn: ({ result }) => result,
    target: query.__.lowLevelAPI.pushData,
  });

  sample({
    clock: fillQueryError,
    fn: ({ error }) => error,
    target: query.__.lowLevelAPI.pushError,
  });

  // -- Refetching
  const { shouldRefetch, __: shouldNotRefetch } = split(
    merge([fillQueryData, fillQueryError]).map(({ refetch }) => refetch),
    {
      shouldRefetch: (refetch): refetch is Refetch<Q> => Boolean(refetch),
    }
  );

  sample({
    clock: shouldRefetch,
    source: $queryState,
    fn: (state, refetch) => {
      if (typeof refetch === 'object' && 'params' in refetch) {
        return { params: refetch.params, refresh: true };
      }

      return { params: state?.params, refresh: true };
    },
    target: [query.__.lowLevelAPI.revalidate, query.$stale.reinit!],
  });

  sample({
    clock: shouldNotRefetch,
    source: $queryState,
    filter: Boolean,
    fn: (state) => ({ params: state.params, refresh: false }),
    target: query.__.lowLevelAPI.revalidate,
  });
}

function queryState<Q extends Query<any, any, any, any>>(
  query: Q
): Store<QueryState<Q>> {
  return combine(
    {
      result: query.$data,
      params: query.__.$latestParams,
      error: query.$error,
      failed: query.$failed,
    },
    ({ result, params, error, failed }): QueryState<Q> => {
      if (!result && !error) {
        return null;
      }

      return failed ? { error, params: params! } : { result, params: params! };
    }
  );
}
