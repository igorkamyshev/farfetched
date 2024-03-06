import type { Event, EventCallable } from 'effector';
import type { RouteParamsAndQuery } from 'atomic-router';

export type ChainProtocol<RouteParams extends Record<string, any>> = {
  beforeOpen: EventCallable<RouteParamsAndQuery<RouteParams>>;
  openOn: Event<any>;
  cancelOn: Event<any>;
};
