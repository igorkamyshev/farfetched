import { attach, createEvent, sample } from 'effector';

import { Contract } from '../contract/type';
import { createJsonApiRequest, Json } from '../fetch/json';
import { ApiRequestError, HttpMethod } from '../fetch/api';
import {
  TwoArgsSourcedField,
  SourcedField,
  normalizeSourced,
} from '../misc/sourced';
import { type ParamsDeclaration } from '../misc/params';
import { Query } from './type';
import { FetchApiRecord } from '../misc/fetch_api';
import {
  createHeadlessQuery,
  SharedQueryFactoryConfig,
  ValidaionField,
} from './create_headless_query';
import { unkownContract } from '../contract/unkown_contract';
import { identity } from '../misc/identity';
import { InvalidDataError } from '../errors/type';

// -- Shared

type RequestConfig<Params, BodySource, QuerySource, HeadersSource, UrlSource> =
  {
    url: SourcedField<Params, string, UrlSource>;
    query?: SourcedField<Params, FetchApiRecord, QuerySource>;
    headers?: SourcedField<Params, FetchApiRecord, HeadersSource>;
  } & (
    | {
        method: 'GET' | 'HEAD';
      }
    | {
        method: Exclude<HttpMethod, 'GET' | 'HEAD'>;
        body: SourcedField<Params, Json, BodySource>;
      }
  );

interface BaseJsonQueryConfigNoParams<
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends SharedQueryFactoryConfig {
  request: RequestConfig<
    void,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
}

interface BaseJsonQueryConfigWithParams<
  Params,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends SharedQueryFactoryConfig {
  params: ParamsDeclaration<Params>;
  request: RequestConfig<
    Params,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
}

// -- Overloads

// params + mapData
function createJsonQuery<
  Params,
  Data,
  TransformedData,
  Error,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  DataSource = void,
  ValidationSource = void
>(
  config: BaseJsonQueryConfigWithParams<
    Params,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data, Error>;
      mapData: TwoArgsSourcedField<Data, Params, TransformedData, DataSource>;
      validate?: ValidaionField<TransformedData, Params, ValidationSource>;
    };
  }
): Query<Params, TransformedData, ApiRequestError | Error | InvalidDataError>;

// params + no mapData
function createJsonQuery<
  Params,
  Data,
  Error,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  ValidationSource = void
>(
  config: BaseJsonQueryConfigWithParams<
    Params,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data, Error>;
      validate?: ValidaionField<Data, Params, ValidationSource>;
    };
  }
): Query<Params, Data, ApiRequestError | Error | InvalidDataError>;

// No params + mapData
function createJsonQuery<
  Data,
  TransformedData,
  Error,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  DataSource = void,
  ValidationSource = void
>(
  config: BaseJsonQueryConfigNoParams<
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data, Error>;
      mapData: TwoArgsSourcedField<Data, void, TransformedData, DataSource>;
      validate?: ValidaionField<TransformedData, void, ValidationSource>;
    };
  }
): Query<void, TransformedData, ApiRequestError | Error | InvalidDataError>;

// No params + no mapData
function createJsonQuery<
  Data,
  Error,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  ValidationSource = void
>(
  config: BaseJsonQueryConfigNoParams<
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data, Error>;
      validate?: ValidaionField<Data, void, ValidationSource>;
    };
  }
): Query<void, Data, ApiRequestError | Error | InvalidDataError>;

// -- Implementation --

function createJsonQuery(config: any) {
  // Basement
  const requestFx = createJsonApiRequest({
    request: { method: config.request.method, credentials: 'same-origin' },
    concurrency: { strategy: 'TAKE_LATEST' },
  });

  const headlessQuery = createHeadlessQuery<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    contract: config.response.contract ?? unkownContract,
    mapData: config.response.mapData ?? identity,
    validate: config.response.validate,
    enabled: config.enabled,
    name: config.name,
  });

  // Connections
  const internalStart = createEvent<any>();

  headlessQuery.__.executeFx.use(
    attach({
      source: {
        url: normalizeSourced({
          field: config.request.url,
          clock: internalStart,
        }),
        body: normalizeSourced({
          field: config.request.body,
          clock: internalStart,
        }),
        headers: normalizeSourced({
          field: config.request.headers,
          clock: internalStart,
        }),
        query: normalizeSourced({
          field: config.request.query,
          clock: internalStart,
        }),
      },
      effect: requestFx,
    })
  );

  sample({ clock: headlessQuery.start, target: internalStart, greedy: true });

  return { ...headlessQuery, __: { executeFx: requestFx } };
}

export { createJsonQuery };
