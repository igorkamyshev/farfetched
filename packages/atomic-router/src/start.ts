import { type Query } from '@farfetched/core';
import { type RouteParamsAndQuery } from 'atomic-router';
import { createEvent, sample } from 'effector';

import { type ChainProtocol } from './chain.ptorocol';

export function startChain(
  query: Query<void, any, any, any>,
  mapParams?: ({ params }: { params: any }) => void
): ChainProtocol<any>;

export function startChain<RouteParams extends Record<string, any>, QueryParams extends any>(
  query: Query<RouteParams, any, any, any>,
  mapParams?: ({ params }: { params: RouteParams }) => QueryParams
): ChainProtocol<RouteParams>;

export function startChain(
  query: Query<any, any, any, any>,
  mapParams: ({ params }: { params: any }) => any = ({ params }) => params
): ChainProtocol<any> {
  const beforeOpen = createEvent<RouteParamsAndQuery<any>>();
  const openOn = createEvent<any>();
  const cancelOn = createEvent<any>();

  sample({
    clock: beforeOpen,
    fn: mapParams,
    target: query.start,
  });
  sample({ clock: query.finished.success, target: openOn });
  sample({
    clock: [query.finished.failure, query.finished.skip],
    target: cancelOn,
  });

  return { beforeOpen, openOn, cancelOn };
}
