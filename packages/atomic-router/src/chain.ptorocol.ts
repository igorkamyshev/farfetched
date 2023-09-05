import { type EventAsReturnType } from 'effector';
import { type RouteParamsAndQuery } from 'atomic-router';

export type ChainProtocol<RouteParams extends Record<string, any>> = {
  beforeOpen: EventAsReturnType<RouteParamsAndQuery<RouteParams>>;
  openOn: EventAsReturnType<any>;
  cancelOn: EventAsReturnType<any>;
};
