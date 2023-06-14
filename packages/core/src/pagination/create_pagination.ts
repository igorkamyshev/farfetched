import { Effect, createEffect } from 'effector';

import { unknownContract } from '../contract/unknown_contract';
import { InvalidDataError } from '../errors/type';
import { DynamicallySourcedField } from '../libs/patronus';
import { resolveExecuteEffect } from '../remote_operation/resolve_execute_effect';
import { Validator } from '../validation/type';
import {
  SharedPaginationFactoryConfig,
  createHeadlessPagination,
} from './create_headless_pagination';
import { Pagination, ParamsAndResult, RequiredPageParams } from './type';
import { Contract } from '../contract/type';

interface HandlerPaginationFactoryConfig<
  Params extends RequiredPageParams,
  Response
> {
  handler: (params: Params) => Response;
  effect?: never;
}

interface EffectPaginationFactoryConfig<
  Params extends RequiredPageParams,
  Response,
  Error
> {
  effect: Effect<Params, Response, Error>;
  handler?: never;
}

// It allows to show types with effect and handler both, but will be show error if use tries pass both one time
type ExecutionPaginationFactoryConfig<
  Params extends RequiredPageParams,
  Data,
  Error
> =
  | HandlerPaginationFactoryConfig<Params, Data>
  | EffectPaginationFactoryConfig<Params, Data, Error>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error
>(
  config: ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, Response>
): Pagination<Params, Response, Error>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error
>(
  config: {
    initialData: Response;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, Response>
): Pagination<Params, Response, Error, Response>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    mapData: DynamicallySourcedField<
      ParamsAndResult<Params, Response>,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<MappedData, Params, ValidationSource>;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, MappedData>
): Pagination<Params, MappedData, Error>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  MappedData,
  MapDataSource = void,
  ValidationSource = void
>(
  config: {
    initialData: MappedData;
    mapData: DynamicallySourcedField<
      ParamsAndResult<Params, Response>,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<MappedData, Params, ValidationSource>;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, MappedData>
): Pagination<Params, MappedData, Error, MappedData>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  ContractData extends Response,
  ValidationSource = void
>(
  config: {
    contract: Contract<Response, ContractData>;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, ContractData>
): Pagination<Params, ContractData, Error | InvalidDataError>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  ContractData extends Response,
  ValidationSource = void
>(
  config: {
    initialData: ContractData;
    contract: Contract<Response, ContractData>;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, ContractData>
): Pagination<Params, ContractData, Error | InvalidDataError, ContractData>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource = void
>(
  config: {
    contract: Contract<Response, ContractData>;
    mapData: DynamicallySourcedField<
      ParamsAndResult<Params, ContractData>,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, MappedData>
): Pagination<Params, MappedData, Error | InvalidDataError>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource = void
>(
  config: {
    initialData: MappedData;
    contract: Contract<Response, ContractData>;
    mapData: DynamicallySourcedField<
      ParamsAndResult<Params, ContractData>,
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
  } & ExecutionPaginationFactoryConfig<Params, Response, Error> &
    SharedPaginationFactoryConfig<Params, MappedData, MappedData>
): Pagination<Params, MappedData, Error | InvalidDataError, MappedData>;

export function createPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource,
  InitialData = null
>(
  config: any
): Pagination<Params, MappedData, Error | InvalidDataError, InitialData> {
  const operation = createHeadlessPagination<
    Params,
    Response,
    Error,
    ContractData,
    MappedData,
    MapDataSource,
    ValidationSource,
    InitialData
  >({
    initialData: config.initialData ?? null,
    contract: config.contract ?? unknownContract,
    hasNextPage: config.hasNextPage,
    hasPrevPage: config.hadPrevPage,
    mapData: config.mapData ?? (({ result }) => result),
    enabled: config.enabled,
    name: config.name,
  });

  operation.__.executeFx.use(resolveExecuteEffect(config));

  return operation;
}
