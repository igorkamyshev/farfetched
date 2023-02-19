import { attach, createEvent, Event, sample, type Json } from 'effector';

import { Contract } from '../contract/type';
import { createJsonApiRequest } from '../fetch/json';
import { HttpMethod, JsonApiRequestError } from '../fetch/api';
import {
  normalizeSourced,
  type SourcedField,
  type DynamicallySourcedField,
} from '../libs/patronus';
import { type ParamsDeclaration } from '../remote_operation/params';
import { Query } from './type';
import { FetchApiRecord } from '../fetch/lib';
import {
  createHeadlessQuery,
  SharedQueryFactoryConfig,
} from './create_headless_query';
import { unknownContract } from '../contract/unknown_contract';
import { Validator } from '../validation/type';

// -- Shared

type ConcurrencyConfig = {
  strategy?: 'TAKE_EVERY' | 'TAKE_FIRST' | 'TAKE_LATEST';
  abort?: Event<void>;
};

type RequestConfig<Params, BodySource, QuerySource, HeadersSource, UrlSource> =
  {
    url: SourcedField<Params, string, UrlSource>;
    credentials?: RequestCredentials;
    query?:
      | SourcedField<Params, FetchApiRecord, QuerySource>
      | SourcedField<Params, string, QuerySource>;
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
  concurrency?: ConcurrencyConfig;
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
  concurrency?: ConcurrencyConfig;
}

// -- Overloads

// params + mapData
export function createJsonQuery<
  Params,
  Data,
  TransformedData,
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
      mapData: DynamicallySourcedField<
        { result: Data; params: Params },
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, Params, ValidationSource>;
    };
  }
): Query<Params, TransformedData, JsonApiRequestError>;

export function createJsonQuery<
  Params,
  Data,
  TransformedData,
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
    initialData?: TransformedData;
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: Params },
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, Params, ValidationSource>;
    };
  }
): Query<Params, TransformedData, JsonApiRequestError, TransformedData>;

// params + no mapData
export function createJsonQuery<
  Params,
  Data,
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
): Query<Params, Data, JsonApiRequestError>;

export function createJsonQuery<
  Params,
  Data,
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
    initialData?: Data;
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, Params, ValidationSource>;
    };
  }
): Query<Params, Data, JsonApiRequestError, Data>;

// No params + mapData
export function createJsonQuery<
  Data,
  TransformedData,
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
      mapData: DynamicallySourcedField<
        { result: Data; params: void },
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, void, ValidationSource>;
    };
  }
): Query<void, TransformedData, JsonApiRequestError>;

export function createJsonQuery<
  Data,
  TransformedData,
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
    initialData?: TransformedData;
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: void },
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, void, ValidationSource>;
    };
  }
): Query<void, TransformedData, JsonApiRequestError, TransformedData>;

// No params + no mapData
export function createJsonQuery<
  Data,
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
): Query<void, Data, JsonApiRequestError>;

export function createJsonQuery<
  Data,
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
    initialData?: Data;
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, void, ValidationSource>;
    };
  }
): Query<void, Data, JsonApiRequestError, Data>;

// -- Implementation --
export function createJsonQuery(config: any) {
  const credentials: RequestCredentials =
    config.request.credentials ?? 'same-origin';

  // Basement
  const requestFx = createJsonApiRequest({
    request: {
      method: config.request.method,
      credentials,
    },
    concurrency: { strategy: config.concurrency?.strategy ?? 'TAKE_LATEST' },
    abort: { clock: config.concurrency?.abort },
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
    initialData: config.initialData,
    contract: config.response.contract ?? unknownContract,
    mapData: config.response.mapData ?? (({ result }) => result),
    validate: config.response.validate,
    enabled: config.enabled,
    name: config.name,
    serialize: config.serialize,
    sources: [url, body, headers, query],
    paramsAreMeaningless: true,
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

  sample({
    clock: [headlessQuery.start, headlessQuery.__.executeFx],
    target: internalStart,
    greedy: true,
  });

  return {
    ...headlessQuery,
    __: { ...headlessQuery.__, executeFx: requestFx },
  };
}
