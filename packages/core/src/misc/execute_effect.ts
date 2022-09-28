import { createEffect, Effect, is } from 'effector';
import { InvalidConfigException } from './config';

export function resolveExecuteEffect<Params, Response, Error = unknown>(
  config:
    | { handler: (params: Params) => Promise<Response> }
    | { effect: Effect<Params, Response, Error> }
): Effect<Params, Response, Error> {
  const anyConfig = config as any;

  if (is.effect(anyConfig.effect)) {
    return anyConfig.effect;
  } else if (typeof anyConfig.handler === 'function') {
    return createEffect<Params, Response, Error>(anyConfig.handler);
  }

  throw new InvalidConfigException(
    'handler or effect must be passed to createQuery'
  );
}
