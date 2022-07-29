import { createEffect, Effect, is } from 'effector';

import { createHeadlessQuery } from './create_headless_query';
import { Query } from './type';
import { InvalidConfigError } from '../misc/config';
import { Contract } from '../contract/type';
import { unkownContract } from '../contract/unkown_contract';
import { identity } from '../misc/identity';
import { StaticOrReactive, TwoArgsSourcedField } from '../misc/sourced';
import { InvalidDataError } from '../errors';

// Overload: Only handler
function createQuery<Params, Response>(config: {
  handler: (p: Params) => Promise<Response>;
  enabled?: StaticOrReactive<boolean>;
}): Query<Params, Response, unknown>;

// Overload: Only effect
function createQuery<Params, Response, Error>(config: {
  effect: Effect<Params, Response, Error>;
  enabled?: StaticOrReactive<boolean>;
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
  enabled?: StaticOrReactive<boolean>;
}): Query<Params, ContractData, Error | InvalidDataError | ContractError>;

// Overload: Effect and MapData
function createQuery<
  Params,
  Response,
  Error,
  MappedData,
  MapDataSource = void
>(config: {
  effect: Effect<Params, Response, Error>;
  mapData: TwoArgsSourcedField<Response, Params, MappedData, MapDataSource>;
  enabled?: StaticOrReactive<boolean>;
}): Query<Params, MappedData, Error>;

// Overload: Effect, Contract and MapData
function createQuery<
  Params,
  Response,
  Error,
  ContractData,
  ContractError,
  MappedData,
  MapDataSource = void
>(config: {
  effect: Effect<Params, Response, Error>;
  contract: Contract<Response, ContractData, ContractError>;
  mapData: TwoArgsSourcedField<ContractData, Params, MappedData, MapDataSource>;
  enabled?: StaticOrReactive<boolean>;
}): Query<Params, MappedData, Error | InvalidDataError | ContractError>;

// -- Implementation --
function createQuery<
  Params,
  Response,
  Error,
  ContractData = Response,
  ContractError = never,
  MappedData = ContractData,
  MapDataSource = void
>(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Query<Params, MappedData, Error | InvalidDataError | ContractError> {
  const query = createHeadlessQuery<
    Params,
    Response,
    Error,
    ContractData,
    ContractError,
    MappedData,
    MapDataSource
  >({
    contract: config.contract ?? unkownContract,
    mapData: config.mapData ?? identity,
    enabled: config.enabled,
  });

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
