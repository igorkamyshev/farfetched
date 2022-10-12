import { attach, createEvent, sample } from 'effector';

import { Contract } from '../contract/type';
import { createJsonApiRequest, Json } from '../fetch/json';
import { ApiRequestError, HttpMethod } from '../fetch/api';
import {
  TwoArgsDynamicallySourcedField,
  SourcedField,
  normalizeSourced,
} from '../misc/sourced';
import { type ParamsDeclaration } from '../misc/params';
import { Query } from './type';
import { FetchApiRecord } from '../misc/fetch_api';
import {
  createHeadlessQuery,
  SharedQueryFactoryConfig,
} from './create_headless_query';
import { unknownContract } from '../contract/unknown_contract';
import { identity } from '../misc/identity';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';

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
        body?: SourcedField<Params, Json, BodySource>;
      }
  );

interface BaseJsonQueryConfigNoParams<
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends SharedQueryFactoryConfig<Data> {
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
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends SharedQueryFactoryConfig<Data> {
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
    TransformedData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data>;
      mapData: TwoArgsDynamicallySourcedField<
        Data,
        Params,
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, Params, ValidationSource>;
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
    Data,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, Params, ValidationSource>;
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
    TransformedData,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data>;
      mapData: TwoArgsDynamicallySourcedField<
        Data,
        void,
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, void, ValidationSource>;
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
    Data,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, void, ValidationSource>;
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

  // Connections
  const internalStart = createEvent<any>();

  const url = normalizeSourced({
    field: config.request.url,
    clock: internalStart,
  });

  const body = normalizeSourced({
    field: config.request.body,
    clock: internalStart,
  });

  const headers = normalizeSourced({
    field: config.request.headers,
    clock: internalStart,
  });

  const query = normalizeSourced({
    field: config.request.query,
    clock: internalStart,
  });

  const headlessQuery = createHeadlessQuery<any, any, any, any, any, any, any>({
    contract: config.response.contract ?? unknownContract,
    mapData: config.response.mapData ?? identity,
    validate: config.response.validate,
    enabled: config.enabled,
    name: config.name,
    serialize: config.serialize,
    sources: [url, body, headers, query],
  });

  headlessQuery.__.executeFx.use(
    attach({
      source: {
        url,
        body,
        headers,
        query,
      },
      effect: requestFx,
    })
  );

  sample({ clock: headlessQuery.start, target: internalStart, greedy: true });

  return {
    ...headlessQuery,
    __: { ...headlessQuery.__, executeFx: requestFx },
  };
}

export { createJsonQuery };
