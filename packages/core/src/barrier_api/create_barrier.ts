import { type Effect, type Event, type Store } from 'effector';

import { type RemoteOperation } from '../remote_operation/type';
import { type Barrier } from './type';

type Performer =
  | RemoteOperation<void, any, any, any>
  | Effect<void, any, any>
  | { start: Event<void>; end: Event<any> };

export function createBarrier(config: {
  active: Store<boolean>;
  perform?: Array<Performer>;
}): Barrier;

export function createBarrier(config: {
  activateOn: Event<any>;
  deactivateOn: Event<any>;
}): Barrier;

export function createBarrier(config: {
  activateOn: {
    failure: (options: { params: unknown; error: unknown }) => boolean;
  };
  perform: Array<Performer>;
}): Barrier;

export function createBarrier(config: {
  activateOn: {
    success: (options: { params: unknown; result: unknown }) => boolean;
  };
  perform: Array<Performer>;
}): Barrier;

export function createBarrier(config: {
  active?: Store<boolean>;
  activateOn?:
    | Event<any>
    | {
        success?: (options: { params: unknown; result: unknown }) => boolean;
        failure?: (options: { params: unknown; error: unknown }) => boolean;
      };
  deactivateOn?: Event<any>;
  perform?: Array<Performer>;
}): Barrier {
  throw new Error('not implemented');
}
