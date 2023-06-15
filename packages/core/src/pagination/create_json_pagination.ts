import { Event, Json, StoreShape, attach, createEvent } from 'effector';

import { HttpMethod, JsonApiRequestError } from '../fetch/api';
import { FetchApiRecord } from '../fetch/lib';
import {
  DynamicallySourcedField,
  SourcedField,
  normalizeSourced,
} from '../libs/patronus';
import { Pagination, ParamsAndResult, RequiredPageParams } from './type';
import {
  SharedPaginationFactoryConfig,
  createHeadlessPagination,
} from './create_headless_pagination';
import { createJsonApiRequest } from '../fetch/json';
import { unknownContract } from '../contract/unknown_contract';
import { ParamsDeclaration, declareParams } from '../remote_operation/params';
import { Contract } from '../contract/type';
import { Validator } from '../validation/type';

// Shared

type Strategy = 'TAKE_EVERY' | 'TAKE_FIRST' | 'TAKE_LATEST';

interface ConcurrencyConfig {
  strategy?: Strategy;
  abort?: Event<void>;
}

type RequestConfigPayload<Params, BodySource> =
  | {
      method: 'GET' | 'HEAD';
    }
  | {
      method: Exclude<HttpMethod, 'GET' | 'HEAD'>;
      body?: SourcedField<Params, Json, BodySource>;
    };

type RequestConfig<Params, BodySource, QuerySource, HeadersSource, UrlSource> =
  {
    url: SourcedField<Params, string, UrlSource>;
    credentials?: RequestCredentials;
    query?:
      | SourcedField<Params, FetchApiRecord, QuerySource>
      | SourcedField<Params, string, QuerySource>;
    headers?: SourcedField<Params, FetchApiRecord, HeadersSource>;
  } & RequestConfigPayload<Params, BodySource>;

type ResponseConfig<Params extends RequiredPageParams, Data> = Pick<
  SharedPaginationFactoryConfig<Params, Data>,
  'hasNextPage' | 'hasPrevPage'
>;

interface BaseJsonPaginationConfigWithParams<
  Params extends RequiredPageParams,
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends Omit<
    SharedPaginationFactoryConfig<Params, Data>,
    'hasNextPage' | 'hasPrevPage'
  > {
  params: ParamsDeclaration<Params>;
  request: RequestConfig<
    Params,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
  response: ResponseConfig<Params, Data>;
  concurrency?: ConcurrencyConfig;
}

interface BaseJsonPaginationConfigNoParams<
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends Omit<
    SharedPaginationFactoryConfig<RequiredPageParams, Data>,
    'hasNextPage' | 'hasPrevPage'
  > {
  request: RequestConfig<
    RequiredPageParams,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
  response: ResponseConfig<RequiredPageParams, Data>;
  concurrency?: ConcurrencyConfig;
}

// Params + Contract
export function createJsonPagination<
  Params extends RequiredPageParams,
  ContractData,
  ValidationSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, Params, ValidationSource>;
    };
  } & BaseJsonPaginationConfigWithParams<
    Params,
    ContractData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<Params, ContractData, JsonApiRequestError>;

export function createJsonPagination<
  Params extends RequiredPageParams,
  ContractData,
  ValidationSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    initialData: ContractData;
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, Params, ValidationSource>;
    };
  } & BaseJsonPaginationConfigWithParams<
    Params,
    ContractData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<Params, ContractData, JsonApiRequestError, ContractData>;

// No params + contract
export function createJsonPagination<
  ContractData,
  ValidationSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, RequiredPageParams, ValidationSource>;
    };
  } & BaseJsonPaginationConfigNoParams<
    ContractData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<RequiredPageParams, ContractData, JsonApiRequestError>;

export function createJsonPagination<
  ContractData,
  ValidationSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    initialData: ContractData;
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, RequiredPageParams, ValidationSource>;
    };
  } & BaseJsonPaginationConfigNoParams<
    ContractData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<
  RequiredPageParams,
  ContractData,
  JsonApiRequestError,
  ContractData
>;

// Params + Contract + MapData
export function createJsonPagination<
  Params extends RequiredPageParams,
  ContractData,
  MappedData,
  ValidationSource = void,
  MapDataSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, Params, ValidationSource>;
      mapData: DynamicallySourcedField<
        ParamsAndResult<Params, ContractData>,
        MappedData,
        MapDataSource
      >;
    };
  } & BaseJsonPaginationConfigWithParams<
    Params,
    MappedData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<Params, MappedData, JsonApiRequestError>;

export function createJsonPagination<
  Params extends RequiredPageParams,
  ContractData,
  MappedData,
  ValidationSource = void,
  MapDataSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    initialData: MappedData;
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, Params, ValidationSource>;
      mapData: DynamicallySourcedField<
        ParamsAndResult<Params, ContractData>,
        MappedData,
        MapDataSource
      >;
    };
  } & BaseJsonPaginationConfigWithParams<
    Params,
    MappedData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<Params, MappedData, JsonApiRequestError, MappedData>;

// No Params + Contract + MapData
export function createJsonPagination<
  ContractData,
  MappedData,
  ValidationSource = void,
  MapDataSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, RequiredPageParams, ValidationSource>;
      mapData: DynamicallySourcedField<
        ParamsAndResult<RequiredPageParams, ContractData>,
        MappedData,
        MapDataSource
      >;
    };
  } & BaseJsonPaginationConfigNoParams<
    MappedData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<RequiredPageParams, MappedData, JsonApiRequestError>;

export function createJsonPagination<
  ContractData,
  MappedData,
  ValidationSource = void,
  MapDataSource = void,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void
>(
  config: {
    initialData: MappedData;
    response: {
      contract: Contract<unknown, ContractData>;
      validate?: Validator<ContractData, RequiredPageParams, ValidationSource>;
      mapData: DynamicallySourcedField<
        ParamsAndResult<RequiredPageParams, ContractData>,
        MappedData,
        MapDataSource
      >;
    };
  } & BaseJsonPaginationConfigNoParams<
    MappedData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >
): Pagination<RequiredPageParams, MappedData, JsonApiRequestError, MappedData>;

//  Implementation
export function createJsonPagination(config: any) {
  const {
    response,
    request,
    initialData,
    enabled,
    name,
    concurrency,
    serialize,
  } = config;

  const credentials: RequestCredentials = request.credentials ?? 'same-origin';

  const requestFx = createJsonApiRequest({
    request: {
      method: request.method as HttpMethod,
      credentials,
    },
    concurrency: { strategy: concurrency?.strategy ?? 'TAKE_LATEST' },
    abort: { clock: concurrency?.abort },
  });

  const pagination = createHeadlessPagination<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    initialData: initialData,
    contract: response.contract ?? unknownContract,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
    mapData: response.mapData ?? (({ result }) => result),
    enabled: enabled,
    name: name,
    serialize: serialize,
    sourced: [request.url, request.body, request.query, request.headers],
    validate: response.validate,
    paramsAreMeaningless: true,
  });

  const internalStart = createEvent<any>();

  const source = {
    url: normalizeSourced({
      field: request.url,
      clock: internalStart,
    }),
    body: normalizeSourced({
      field: request.body,
      clock: internalStart,
    }),
    headers: normalizeSourced({
      field: request.headers,
      clock: internalStart,
    }),
    query: normalizeSourced({
      field: request.query,
      clock: internalStart,
    }),
  } as StoreShape;

  pagination.__.executeFx.use(
    attach({
      source,
      effect: requestFx,
    })
  );

  return {
    ...pagination,
    __: {
      ...pagination.__,
      executeFx: requestFx,
    },
  };
}
