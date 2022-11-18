import { Effect } from 'effector';

import {
  createHeadlessQuery,
  SharedQueryFactoryConfig,
} from './create_headless_query';
import { Query } from './type';
import { Contract } from '../contract/type';
import { unknownContract } from '../contract/unknown_contract';
import { identity } from '../misc/identity';
import { TwoArgsDynamicallySourcedField } from '../misc/sourced';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';
import { resolveExecuteEffect } from '../misc/execute_effect';

// Overload: Only handler
function createQuery<Params, Response>(
  config: {
    handler: (p: Params) => Promise<Response>;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, unknown>;

function createQuery<Params, Response>(
  config: {
    initialData: Response;
    handler: (p: Params) => Promise<Response>;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, unknown, Response>;

// Overload: Only effect
function createQuery<Params, Response, Error>(
  config: {
    effect: Effect<Params, Response, Error>;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, Error>;

function createQuery<Params, Response, Error>(
  config: {
    initialData: Response;
    effect: Effect<Params, Response, Error>;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, Error, Response>;

// Overload: Effect and Contract
function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  ValidationSource = void
>(
  config: {
    effect: Effect<Params, Response, Error>;
    contract: Contract<Response, ContractData>;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<ContractData>
): Query<Params, ContractData, Error | InvalidDataError>;

function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  ValidationSource = void
>(
  config: {
    initialData: ContractData;
    effect: Effect<Params, Response, Error>;
    contract: Contract<Response, ContractData>;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<ContractData>
): Query<Params, ContractData, Error | InvalidDataError, ContractData>;

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
    mapData: TwoArgsDynamicallySourcedField<
      Response,
      Params,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<MappedData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error>;

function createQuery<
  Params,
  Response,
  Error,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    initialData: MappedData;
    effect: Effect<Params, Response, Error>;
    mapData: TwoArgsDynamicallySourcedField<
      Response,
      Params,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<MappedData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error, MappedData>;

// Overload: Effect, Contract and MapData
function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    effect: Effect<Params, Response, Error>;
    contract: Contract<Response, ContractData>;
    mapData: TwoArgsDynamicallySourcedField<
      ContractData,
      Params,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error | InvalidDataError>;

function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    initialData: MappedData;
    effect: Effect<Params, Response, Error>;
    contract: Contract<Response, ContractData>;
    mapData: TwoArgsDynamicallySourcedField<
      ContractData,
      Params,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error | InvalidDataError, MappedData>;

// -- Implementation --
function createQuery<
  Params,
  Response,
  Error,
  ContractData extends Response = Response,
  MappedData = ContractData,
  MapDataSource = void,
  ValidationSource = void
>(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Query<Params, MappedData, Error | InvalidDataError, MappedData> {
  const query = createHeadlessQuery<
    Params,
    Response,
    Error,
    ContractData,
    MappedData,
    MapDataSource,
    ValidationSource,
    MappedData
  >({
    initialData: config.initialData ?? null,
    contract: config.contract ?? unknownContract,
    mapData: config.mapData ?? identity,
    enabled: config.enabled,
    validate: config.validate,
    name: config.name,
    serialize: config.serialize,
  });

  query.__.executeFx.use(resolveExecuteEffect<Params, Response, Error>(config));

  return query;
}

export { createQuery };
