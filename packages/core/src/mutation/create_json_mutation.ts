import { attach, createEvent, Event, sample, type Json } from 'effector';

import { Contract } from '../contract/type';
import { unknownContract } from '../contract/unknown_contract';
import { HttpMethod, JsonApiRequestError } from '../fetch/api';
import { createJsonApiRequest } from '../fetch/json';
import { FetchApiRecord } from '../fetch/lib';
import { ParamsDeclaration } from '../remote_operation/params';
import {
  DynamicallySourcedField,
  normalizeSourced,
  type SourcedField,
} from '../libs/patronus';
import { Validator } from '../validation/type';
import {
  createHeadlessMutation,
  SharedMutationFactoryConfig,
} from './create_headless_mutation';
import { Mutation } from './type';

// -- Shared --

type ConcurrencyConfig = {
  abort?: Event<void>;
};

type RequestConfig<Params> = {
  url: SourcedField<Params, string>;
  credentials?: RequestCredentials;
  query?: SourcedField<Params, FetchApiRecord> | SourcedField<Params, string>;
  headers?: SourcedField<Params, FetchApiRecord>;
} & (
  | {
      method: 'GET' | 'HEAD';
    }
  | {
      method: Exclude<HttpMethod, 'GET' | 'HEAD'>;
      body?: SourcedField<Params, Json>;
    }
);

interface BaseJsonMutationConfigNoParams extends SharedMutationFactoryConfig {
  request: RequestConfig<void>;
  concurrency?: ConcurrencyConfig;
}

interface BaseJsonMutationConfigWithParams<Params>
  extends SharedMutationFactoryConfig {
  params: ParamsDeclaration<Params>;
  request: RequestConfig<Params>;
  concurrency?: ConcurrencyConfig;
}

// -- Overloads

// params + mapData
export function createJsonMutation<Params, Data, TransformedData>(
  config: BaseJsonMutationConfigWithParams<Params> & {
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: Params },
        TransformedData
      >;
      validate?: Validator<TransformedData, Params>;
      status?: { expected: number | number[] };
    };
  }
): Mutation<Params, TransformedData, JsonApiRequestError>;

// params + no mapData
export function createJsonMutation<Params, Data>(
  config: BaseJsonMutationConfigWithParams<Params> & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, Params>;
      status?: { expected: number | number[] };
    };
  }
): Mutation<Params, Data, JsonApiRequestError>;

// No params + mapData
export function createJsonMutation<Data, TransformedData>(
  config: BaseJsonMutationConfigNoParams & {
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: void },
        TransformedData
      >;
      validate?: Validator<TransformedData, void>;
      status?: { expected: number | number[] };
    };
  }
): Mutation<void, TransformedData, JsonApiRequestError>;

// No params + no mapData
export function createJsonMutation<Data>(
  config: BaseJsonMutationConfigNoParams & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, void>;
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
    concurrency: { strategy: 'TAKE_EVERY' },
    response: { status: config.response.status },
    abort: { clock: config.concurrency?.abort },
  });

  const headlessMutation = createHeadlessMutation({
    contract: config.response.contract ?? unknownContract,
    mapData: config.response.mapData ?? (({ result }) => result),
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
    clock: [headlessMutation.start, headlessMutation.__.executeFx],
    target: internalStart,
    greedy: true,
  });

  return {
    ...headlessMutation,
    __: { ...headlessMutation.__, executeFx: requestFx },
  };
}
