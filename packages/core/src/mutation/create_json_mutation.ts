import { attach, type Json, type Event, createEffect } from 'effector';

import { type Contract } from '../contract/type';
import { unknownContract } from '../contract/unknown_contract';
import { type HttpMethod, type JsonApiRequestError } from '../fetch/api';
import { createJsonApiRequest } from '../fetch/json';
import { type FetchApiRecord } from '../fetch/lib';
import { type ParamsDeclaration } from '../remote_operation/params';
import {
  type DynamicallySourcedField,
  type SourcedField,
  normalizeSourced,
} from '../libs/patronus';
import { type Validator } from '../validation/type';
import {
  createHeadlessMutation,
  type SharedMutationFactoryConfig,
} from './create_headless_mutation';
import { type Mutation } from './type';
import { concurrency } from '../concurrency/concurrency';
import { onAbort } from '../remote_operation/on_abort';

// -- Shared --

type ConcurrencyConfig = {
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

interface BaseJsonMutationConfigNoParams<
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends SharedMutationFactoryConfig {
  request: RequestConfig<
    void,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  >;
  concurrency?: ConcurrencyConfig;
}

interface BaseJsonMutationConfigWithParams<
  Params,
  Data,
  BodySource,
  QuerySource,
  HeadersSource,
  UrlSource
> extends SharedMutationFactoryConfig {
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
export function createJsonMutation<
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
  config: BaseJsonMutationConfigWithParams<
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
      status?: { expected: number | number[] };
    };
  }
): Mutation<Params, TransformedData, JsonApiRequestError>;

// params + no mapData
export function createJsonMutation<
  Params,
  Data,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  ValidationSource = void
>(
  config: BaseJsonMutationConfigWithParams<
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
      status?: { expected: number | number[] };
    };
  }
): Mutation<Params, Data, JsonApiRequestError>;

// No params + mapData
export function createJsonMutation<
  Data,
  TransformedData,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  DataSource = void,
  ValidationSource = void
>(
  config: BaseJsonMutationConfigNoParams<
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
      status?: { expected: number | number[] };
    };
  }
): Mutation<void, TransformedData, JsonApiRequestError>;

// No params + no mapData
export function createJsonMutation<
  Data,
  BodySource = void,
  QuerySource = void,
  HeadersSource = void,
  UrlSource = void,
  ValidationSource = void
>(
  config: BaseJsonMutationConfigNoParams<
    Data,
    BodySource,
    QuerySource,
    HeadersSource,
    UrlSource
  > & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, void, ValidationSource>;
      status?: { expected: number | number[] };
    };
  }
): Mutation<void, Data, JsonApiRequestError>;

// -- Implementation --
export function createJsonMutation(config: any): Mutation<any, any, any> {
  const credentials: RequestCredentials =
    config.request.credentials ?? 'same-origin';

  const requestFx = createJsonApiRequest({
    request: { method: config.request.method, credentials },
    response: { status: config.response.status },
  });

  const headlessMutation = createHeadlessMutation({
    contract: config.response.contract ?? unknownContract,
    mapData: config.response.mapData ?? (({ result }) => result),
    validate: config.response.validate,
    enabled: config.enabled,
    name: config.name,
  });

  const executeFx = createEffect((c: any) => {
    const abortController = new AbortController();
    onAbort(() => abortController.abort());
    return requestFx({ ...c, abortController });
  });

  headlessMutation.__.executeFx.use(
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
    ...headlessMutation,
    __: { ...headlessMutation.__, executeFx },
  };

  /* TODO: in future releases we will remove this code and make concurrency a separate function */
  concurrency(op, {
    strategy: config.concurrency?.strategy ?? 'TAKE_EVERY',
    abort: config.concurrency?.abort,
  });

  return op;
}
