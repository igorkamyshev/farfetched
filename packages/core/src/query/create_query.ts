import { createEffect, Effect, is } from 'effector';

import {
  createHeadlessQuery,
  SharedQueryFactoryConfig,
} from './create_headless_query';
import { Query } from './type';
import { InvalidConfigException } from '../misc/config';
import { Contract } from '../contract/type';
import { unkownContract } from '../contract/unkown_contract';
import { identity } from '../misc/identity';
import { TwoArgsDynamicallySourcedField } from '../misc/sourced';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';

// Overload: Only handler
function createQuery<Params, Response>(
  config: {
    handler: (p: Params) => Promise<Response>;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, unknown>;

// Overload: Only effect
function createQuery<Params, Response, Error>(
  config: {
    effect: Effect<Params, Response, Error>;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, Error>;

// Overload: Effect and Contract
function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  ContractError extends Response,
  ValidationSource = void
>(
  config: {
    effect: Effect<Params, Response, Error>;
    contract: Contract<Response, ContractData, ContractError>;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<ContractData>
): Query<Params, ContractData, Error | InvalidDataError | ContractError>;

// Overload: Effect and MapData
function createQuery<
  Params,
  Response,
  Error,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    effect: Effect<Params, Response, Error>;
    mapData: TwoArgsDynamicallySourcedField<Response, Params, MappedData, MapDataSource>;
    validate?: Validator<MappedData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error>;

// Overload: Effect, Contract and MapData
function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  ContractError extends Response,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    effect: Effect<Params, Response, Error>;
    contract: Contract<Response, ContractData, ContractError>;
    mapData: TwoArgsDynamicallySourcedField<
      ContractData,
      Params,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error | InvalidDataError | ContractError>;

// -- Implementation --
function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response = Response,
  ContractError extends Response = never,
  MappedData = ContractData,
  MapDataSource = void,
  ValidationSource = void
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
    MapDataSource,
    ValidationSource
  >({
    contract: config.contract ?? unkownContract,
    mapData: config.mapData ?? identity,
    enabled: config.enabled,
    validate: config.validate,
    name: config.name,
    serialize: config.serialize,
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

  throw new InvalidConfigException(
    'handler or effect must be passed to createQuery'
  );
}

export { createQuery };
