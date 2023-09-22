import { Effect } from 'effector';

import {
  createHeadlessQuery,
  SharedQueryFactoryConfig,
} from './create_headless_query';
import { Query } from './type';
import { Contract } from '../contract/type';
import { unknownContract } from '../contract/unknown_contract';
import { type DynamicallySourcedField } from '../libs/patronus';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';
import { resolveExecuteEffect } from '../remote_operation/resolve_execute_effect';
import { normalizeExtraDependencies, type ExtraDependencies } from "./extra-dependencies";

// Overload: Only handler
export function createQuery<Params, Response>(
  config: {
    handler: (p: Params) => Promise<Response>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, unknown>;

export function createQuery<Params, Response>(
  config: {
    initialData: Response;
    handler: (p: Params) => Promise<Response>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, unknown, Response>;

// Overload: Effect and MapData
export function createQuery<
  Params,
  Response,
  Error,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    effect: Effect<Params, Response, Error>;
    mapData: DynamicallySourcedField<
      { result: Response; params: Params },
      MappedData,
      MapDataSource
    >;
    validate?: Validator<MappedData, Params, ValidationSource>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error>;

// Overload: Only effect
export function createQuery<Params, Response, Error>(
  config: {
    effect: Effect<Params, Response, Error>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, Error>;

export function createQuery<Params, Response, Error>(
  config: {
    initialData: Response;
    effect: Effect<Params, Response, Error>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<Response>
): Query<Params, Response, Error, Response>;

// Overload: Effect and Contract
export function createQuery<
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
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<ContractData>
): Query<Params, ContractData, Error | InvalidDataError>;

export function createQuery<
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
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<ContractData>
): Query<Params, ContractData, Error | InvalidDataError, ContractData>;

export function createQuery<
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
    mapData: DynamicallySourcedField<
      { result: Response; params: Params },
      MappedData,
      MapDataSource
    >;
    validate?: Validator<MappedData, Params, ValidationSource>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error, MappedData>;

// Overload: Effect, Contract and MapData
export function createQuery<
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
    mapData: DynamicallySourcedField<
      { result: ContractData; params: Params },
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error | InvalidDataError>;

export function createQuery<
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
    mapData: DynamicallySourcedField<
      { result: ContractData; params: Params },
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
    extraDependencies?: ExtraDependencies;
  } & SharedQueryFactoryConfig<MappedData>
): Query<Params, MappedData, Error | InvalidDataError, MappedData>;

// -- Implementation --
export function createQuery<
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
    mapData: config.mapData ?? (({ result }) => result),
    enabled: config.enabled,
    validate: config.validate,
    name: config.name,
    serialize: config.serialize,
    sourced: normalizeExtraDependencies(config.extraDependencies)
  });

  query.__.executeFx.use(resolveExecuteEffect(config));

  return query;
}
