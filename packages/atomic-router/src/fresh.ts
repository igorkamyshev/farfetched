import { type Query } from '@farfetched/core';

import { type ChainProtocol } from './chain.ptorocol';

export function freshChain(
  query: Query<void, any, any, any>
): ChainProtocol<any>;

export function freshChain<RouteParams extends Record<string, any>>(
  query: Query<RouteParams, any, any, any>
): ChainProtocol<RouteParams>;

export function freshChain(
  query: Query<any, any, any, any>
): ChainProtocol<any> {
  return {} as any;
}
