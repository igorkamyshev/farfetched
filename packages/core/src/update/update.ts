import {
  combine,
  createEvent,
  createStore,
  sample,
  split,
  Store,
} from 'effector';

import { isNotEmpty } from '../libs/lohyphen';
import { DynamicallySourcedField, normalizeSourced } from '../libs/patronus';
import { Mutation } from '../mutation/type';
import { Query } from '../query/type';
import {
  RemoteOperationError,
  RemoteOperationParams,
  RemoteOperationResult,
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

export function update<
  Q extends Query<any, any, any, any>,
  M extends Mutation<any, any, any>,
  BySuccessSource = void,
  ByFailureSource = void
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
        | { result: RemoteOperationResult<Q> }
        | { error: RemoteOperationError<Q> },
        BySuccessSource
      >;
      failure?: DynamicallySourcedField<
        {
          query: QueryState<Q>;
          mutation: {
            error: RemoteOperationError<M>;
            params: RemoteOperationParams<M>;
          };
        },
        | { result: RemoteOperationResult<Q> }
        | { error: RemoteOperationError<Q> },
        ByFailureSource
      >;
    };
  }
): void {
  const $queryState = queryState(query);

  const fillQueryData = createEvent<{ result: RemoteOperationResult<Q> }>();
  const fillQueryError = createEvent<{ error: RemoteOperationError<Q> }>();

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
            mutation: { result, params },
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
              mutation: { error, params },
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
    target: [query.$data, query.$error.reinit!],
  });

  sample({
    clock: fillQueryError,
    fn: ({ error }) => error,
    target: [query.$error, query.$data.reinit!],
  });
}

function queryState<Q extends Query<any, any, any, any>>(
  query: Q
): Store<QueryState<Q>> {
  return combine(
    {
      result: query.$data,
      params: createStore(null, { serialize: 'ignore' }).on(
        query.finished.finally,
        (_, { params }) => params
      ),
      error: query.$error,
      failed: query.$failed,
    },
    ({ result, params, error, failed }): QueryState<Q> => {
      if (!params) {
        return null;
      }

      return failed ? { error, params } : { result, params };
    }
  );
}
