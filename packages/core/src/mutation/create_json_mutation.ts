import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import { HttpMethod } from '../fetch/api';
import { Json } from '../fetch/json';
import { FetchApiRecord } from '../misc/fetch_api';
import { ParamsDeclaration } from '../misc/params';
import { SourcedField } from '../misc/sourced';
import { Validator } from '../validation/type';
import { SharedMutationFactoryConfig } from './create_headless_mutation';
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

// -- Overloads --

// Params
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
      status?: { expected: number | number[] };
      validate?: Validator<Data, Params, ValidationSource>;
    };
  }
): Mutation<Params, Data, Error | InvalidDataError>;

// No params
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
      status?: { expected: number | number[] };
      validate?: Validator<Data, void, ValidationSource>;
    };
  }
): Mutation<void, Data, Error | InvalidDataError>;

// -- Implementation --

function createJsonMutation(c: any): Mutation<any, any, any> {
  return null as any;
}

export { createJsonMutation };
