import { Store } from 'effector';

import { RemoteOperation } from '../remote_operation/type';

export function attachOperation<O extends RemoteOperation<any, any, any, any>>(
  operation: O
): O;

export function attachOperation<
  NewParams,
  OriginalParams,
  O extends RemoteOperation<OriginalParams, any, any, any>
>(
  operation: O,
  config: { mapParams: (params: NewParams) => OriginalParams }
): O;

export function attachOperation<
  NewParams,
  OriginalParams,
  O extends RemoteOperation<OriginalParams, any, any, any>,
  Source
>(
  operation: O,
  config: {
    source: Store<Source>;
    mapParams: (params: NewParams, source: Source) => OriginalParams;
  }
): O;

export function attachOperation<
  NewParams,
  OriginalParams,
  O extends RemoteOperation<OriginalParams, any, any, any>
>(
  operation: O,
  config?: {
    source?: Store<any>;
    mapParams?: (params: NewParams, source?: any) => OriginalParams;
  }
): O {
  const { source, mapParams } = config ?? {};

  return operation;
}
