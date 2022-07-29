import { attach, createEvent, sample } from 'effector';

import { Contract } from '../contract/type';
import { createJsonApiRequest, Json } from '../fetch/json';
import { ApiRequestError, HttpMethod } from '../fetch/api';
import {
  TwoArgsSourcedField,
  SourcedField,
  normalizeSourced,
  StaticOrReactive,
} from '../misc/sourced';
import { type ParamsDeclaration } from '../misc/params';
import { Query } from './type';
import { FetchApiRecord } from '../misc/fetch_api';
import { createHeadlessQuery } from './create_headless_query';
import { unkownContract } from '../contract/unkown_contract';
import { identity } from '../misc/identity';
import { InvalidDataError } from '../errors';

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
> {
  enabled?: StaticOrReactive<boolean>;
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
> {
  enabled?: StaticOrReactive<boolean>;
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
  DataSource = void
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
  UrlSource = void
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
  DataSource = void
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
  UrlSource = void
>(
  config: BaseJsonQueryConfigNoParams<
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data, Error>;
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

  const headlessQuery = createHeadlessQuery<any, any, any, any, any, any, any>(
    {
      contract: config.response.contract ?? unkownContract,
      mapData: config.response.mapData ?? identity,
      enabled: config.enabled,
    },
    { sid: 'j' }
  );

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
