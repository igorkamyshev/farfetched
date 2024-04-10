import { createStore, type Store } from 'effector';

import { Mutation } from '../mutation/type';
import { Query, QueryInitialData } from '../query/type';
import {
  RemoteOperation,
  RemoteOperationError,
  RemoteOperationParams,
  RemoteOperationResult,
} from '../remote_operation/type';

// -- Query overloads

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<
  NewParams,
  Q extends Query<any, any, any, any>,
  Source,
>(
  operation: Q,
  config: {
    source: Store<Source>;
    mapParams: (params: NewParams, source: Source) => RemoteOperationParams<Q>;
  }
): Query<
  NewParams,
  RemoteOperationResult<Q>,
  RemoteOperationError<Q>,
  QueryInitialData<Q>
>;

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<NewParams, Q extends Query<any, any, any, any>>(
  operation: Q,
  config: { mapParams: (params: NewParams) => RemoteOperationParams<Q> }
): Query<
  NewParams,
  RemoteOperationResult<Q>,
  RemoteOperationError<Q>,
  QueryInitialData<Q>
>;

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<Q extends Query<any, any, any, any>>(
  operation: Q
): Q;

// -- Mutation overloads

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<
  NewParams,
  M extends Mutation<any, any, any>,
  Source,
>(
  operation: M,
  config: {
    source: Store<Source>;
    mapParams: (params: NewParams, source: Source) => RemoteOperationParams<M>;
  }
): Mutation<NewParams, RemoteOperationResult<M>, RemoteOperationError<M>>;

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<NewParams, M extends Mutation<any, any, any>>(
  operation: M,
  config: { mapParams: (params: NewParams) => RemoteOperationParams<M> }
): Mutation<NewParams, RemoteOperationResult<M>, RemoteOperationError<M>>;

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<M extends Mutation<any, any, any>>(
  operation: M
): M;

// -- Implementation

/**
 * @deprecated Deprecated since 0.12
 * @see {@link https://farfetched.pages.dev/adr/attach_operation_deprecation.html#how-to-migrate}
 */
export function attachOperation<
  NewParams,
  OriginalParams,
  O extends RemoteOperation<OriginalParams, any, any, any>,
>(
  operation: O,
  config?: {
    source?: Store<any>;
    mapParams?: (params: NewParams, source?: any) => OriginalParams;
  }
) {
  const { source, mapParams } = config ?? {};

  return operation.__.experimentalAPI?.attach({
    source:
      source ??
      createStore(null, {
        serialize: 'ignore',
      }),
    mapParams: mapParams ?? ((v: NewParams) => v as unknown as OriginalParams),
  });
}
