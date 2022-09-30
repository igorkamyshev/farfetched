import { attach, createEvent, sample } from 'effector';
import { Contract } from '../contract/type';
import { unknownContract } from '../contract/unknown_contract';
import { InvalidDataError } from '../errors/type';
import { ApiRequestError, HttpMethod } from '../fetch/api';
import { createJsonApiRequest, Json } from '../fetch/json';
import { FetchApiRecord } from '../misc/fetch_api';
import { identity } from '../misc/identity';
import { ParamsDeclaration } from '../misc/params';
import {
  normalizeSourced,
  SourcedField,
  TwoArgsDynamicallySourcedField,
} from '../misc/sourced';
import { Validator } from '../validation/type';
import {
  createHeadlessMutation,
  SharedMutationFactoryConfig,
} from './create_headless_mutation';
import { Mutation } from './type';

// -- Shared --

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
}

// -- Overloads

// params + mapData
function createJsonMutation<
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
      mapData: TwoArgsDynamicallySourcedField<
        Data,
        Params,
        TransformedData,
        DataSource
      >;
      validate?: Validator<TransformedData, Params, ValidationSource>;
      status?: { expected: number | number[] };
    };
  }
): Mutation<
  Params,
  TransformedData,
  ApiRequestError | Error | InvalidDataError
>;

// params + no mapData
function createJsonMutation<
  Params,
  Data,
  Error,
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
): Mutation<Params, Data, ApiRequestError | Error | InvalidDataError>;

// No params + mapData
function createJsonMutation<
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
  config: BaseJsonMutationConfigNoParams<
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
      status?: { expected: number | number[] };
    };
  }
): Mutation<void, TransformedData, ApiRequestError | Error | InvalidDataError>;

// No params + no mapData
function createJsonMutation<
  Data,
  Error,
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
): Mutation<void, Data, ApiRequestError | Error | InvalidDataError>;

// -- Implementation --

function createJsonMutation(config: any): Mutation<any, any, any> {
  const requestFx = createJsonApiRequest({
    request: { method: config.request.method, credentials: 'same-origin' },
    concurrency: { strategy: 'TAKE_EVERY' },
    response: { status: config.response.status },
  });

  const headlessMutation = createHeadlessMutation({
    contract: config.response.contract ?? unknownContract,
    mapData: config.response.mapData ?? identity,
    validate: config.response.validate,
    enabled: config.enabled,
    name: config.name,
  });

  const internalStart = createEvent<any>();

  headlessMutation.__.executeFx.use(
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

  sample({
    clock: headlessMutation.start,
    target: internalStart,
    greedy: true,
  });

  return {
    ...headlessMutation,
    __: { ...headlessMutation.__, executeFx: requestFx },
  };
}

export { createJsonMutation };
