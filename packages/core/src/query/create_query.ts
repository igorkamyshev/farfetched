import { createEffect, Effect, is } from 'effector';

import { createHeadlessQuery } from './create_headless_query';
import { Query } from './type';
import { InvalidConfigError } from '../misc/config';
import { OptionalConfig } from '../misc/sid';

// Overload: Only handler
function createQuery<Params, Response>(
  config: {
    handler: (p: Params) => Promise<Response>;
  },
  optionalConfig?: OptionalConfig
): Query<Params, Response, unknown>;

// Overload: Only effect
function createQuery<Params, Response, Error>(
  config: {
    effect: Effect<Params, Response, Error>;
  },
  optionalConfig?: OptionalConfig
): Query<Params, Response, Error>;

// -- Implementation --
function createQuery<Params, Response, Error = unknown>(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  optionalConfig?: OptionalConfig
): Query<Params, Response, Error> {
  const query = createHeadlessQuery<Params, Response, Error>(optionalConfig);

  query.__.executeFx.use(resolveExecuteFx<Params, Response, Error>(config));

  return query;
}

function resolveExecuteFx<Params, Response, Error = unknown>(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Effect<Params, Response, Error> {
  if (is.effect(config.effect)) {
    return config.effect;
  } else if (typeof config.handler === 'function') {
    return createEffect<Params, Response, Error>(config.handler);
  }

  throw new InvalidConfigError(
    'handler or effect must be passed to createQuery'
  );
}

export { createQuery };
