import { createEffect, Effect, is } from 'effector';

import { createHeadlessQuery } from './create_headless_query';
import { Query } from './type';
import { InvalidConfigError } from '../misc/config';
import { Contract } from '../contract/type';
import { unkownContract } from '../contract/unkown_contract';
import { InvalidDataError } from '../contract/error';

// Overload: Only handler
function createQuery<Params, Response>(config: {
  handler: (p: Params) => Promise<Response>;
}): Query<Params, Response, unknown>;

// Overload: Only effect
function createQuery<Params, Response, Error>(config: {
  effect: Effect<Params, Response, Error>;
}): Query<Params, Response, Error>;

// Overload: Effect and Contract
function createQuery<
  Params,
  Response,
  Error,
  ContractData,
  ContractError
>(config: {
  effect: Effect<Params, Response, Error>;
  contract: Contract<Response, ContractData, ContractError>;
}): Query<
  Params,
  ContractData,
  Error | InvalidDataError<Response> | ContractError
>;

// -- Implementation --
function createQuery<
  Params,
  Response,
  Error,
  ContractData = Response,
  ContractError = never
>(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Query<
  Params,
  ContractData,
  Error | InvalidDataError<Response> | ContractError
> {
  const query = createHeadlessQuery<
    Params,
    Response,
    Error,
    ContractData,
    ContractError
  >({ contract: config.contract ?? unkownContract });

  query.__.executeFx.use(resolveExecuteEffect<Params, Response, Error>(config));

  return query;
}

function resolveExecuteEffect<Params, Response, Error = unknown>(
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
