import { type Query } from '@farfetched/core';
import { type RouteParamsAndQuery } from 'atomic-router';
import { createEvent, sample } from 'effector';

import { type ChainProtocol } from './chain.ptorocol';

export function freshChain(
  query: Query<void, any, any, any>,
  mapParams?: ({ params }: { params: any }) => void
): ChainProtocol<any>;

export function freshChain<
  RouteParams extends Record<string, any>,
  QueryParams extends any,
>(
  query: Query<QueryParams, any, any, any>,
  mapParams?: ({ params }: { params: RouteParams }) => QueryParams
): ChainProtocol<RouteParams>;

export function freshChain(
  query: Query<any, any, any, any>,
  mapParams: ({ params }: { params: any }) => any = ({ params }) => params
): ChainProtocol<any> {
  const beforeOpen = createEvent<RouteParamsAndQuery<any>>();
  const openOn = createEvent<any>();
  const cancelOn = createEvent<any>();

  sample({
    clock: beforeOpen,
    fn: mapParams,
    target: query.refresh,
  });
  sample({
    clock: [
      query.finished.success,
      query.__.lowLevelAPI.refreshSkipDueToFreshness,
    ],
    target: openOn,
  });
  sample({
    clock: [query.finished.failure, query.finished.skip],
    target: cancelOn,
  });

  return { beforeOpen, openOn, cancelOn };
}
