import { attach, createEffect, type Event, type Json } from 'effector';

import { type Contract } from '../contract/type';
import { createJsonApiRequest } from '../fetch/json';
import { type HttpMethod, type JsonApiRequestError } from '../fetch/api';
import {
  normalizeSourced,
  type SourcedField,
  type DynamicallySourcedField,
} from '../libs/patronus';
import { type ParamsDeclaration } from '../remote_operation/params';
import { type Query } from './type';
import { type FetchApiRecord } from '../fetch/lib';
import {
  createHeadlessQuery,
  type SharedQueryFactoryConfig,
} from './create_headless_query';
import { unknownContract } from '../contract/unknown_contract';
import { type Validator } from '../validation/type';
import { concurrency } from '../concurrency/concurrency';
import { onAbort } from '../remote_operation/on_abort';

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
  UrlSource,
> extends SharedQueryFactoryConfig<Data> {
  request: RequestConfig<
    void,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
  /**
   * @deprecated Deprecated since 0.12, use `concurrency` operator instead
   * @see {@link https://ff.effector.dev/adr/concurrency}
   */
  concurrency?: ConcurrencyConfig;
}

interface BaseJsonQueryConfigWithParams<
  Params,
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource,
> extends SharedQueryFactoryConfig<Data> {
  params: ParamsDeclaration<Params>;
  request: RequestConfig<
    Params,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
  /**
   * @deprecated Deprecated since 0.12, use `concurrency` operator instead
   * @see {@link https://ff.effector.dev/adr/concurrency}
   */
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  ValidationSource = void,
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
  const credentials: RequestCredentials | undefined =
    config.request.credentials;

  // Basement
  const requestFx = createJsonApiRequest({
    request: {
      method: config.request.method,
      credentials,
    },
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
    sourced: [
      config.request.url,
      config.request.body,
      config.request.headers,
      config.request.query,
    ],
    paramsAreMeaningless: true,
  });

  const executeFx = createEffect((c: any) => {
    const abortController = new AbortController();
    onAbort(() => abortController.abort());
    return requestFx({ ...c, abortController });
  });

  headlessQuery.__.executeFx.use(
    attach({
      source: {
        partialUrl: normalizeSourced({
          field: config.request.url,
        }),
        partialBody: normalizeSourced({
          field: config.request.body,
        }),
        partialHeaders: normalizeSourced({
          field: config.request.headers,
        }),
        partialQuery: normalizeSourced({
          field: config.request.query,
        }),
      },
      mapParams(
        params: any,
        { partialUrl, partialBody, partialHeaders, partialQuery }
      ) {
        return {
          url: partialUrl(params),
          body: partialBody(params),
          headers: partialHeaders(params),
          query: partialQuery(params),
        };
      },
      effect: executeFx,
    })
  );

  const op = {
    ...headlessQuery,
    __: { ...headlessQuery.__, executeFx },
  };

  /* TODO: in future releases we will remove this code and make concurrency a separate function */
  if (config.concurrency) {
    console.error(
      'concurrency field in createJsonQuery is deprecated, please use concurrency operator instead: https://farfetched.pages.dev/adr/concurrency'
    );

    op.__.meta.flags.concurrencyFieldUsed = true;
  }

  setTimeout(() => {
    if (!op.__.meta.flags.concurrencyOperatorUsed) {
      console.error(
        'Please apply concurrency operator to the query, read more: https://farfetched.pages.dev/adr/concurrency'
      );

      concurrency(op, {
        strategy: config.concurrency?.strategy ?? 'TAKE_LATEST',
        abortAll: config.concurrency?.abort,
      });
    }
  });

  return op;
}
