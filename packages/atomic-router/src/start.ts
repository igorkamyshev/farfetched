import { type Query } from '@farfetched/core';

import { type ChainProtocol } from './chain.ptorocol';

export function startChain(
  query: Query<void, any, any, any>
): ChainProtocol<any>;

export function startChain<RouteParams extends Record<string, any>>(
  query: Query<RouteParams, any, any, any>
): ChainProtocol<RouteParams>;

export function startChain(
  query: Query<any, any, any, any>
): ChainProtocol<any> {
  return {} as any;
}
