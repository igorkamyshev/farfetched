import { attach, createEvent, Event, sample, type Json } from 'effector';

import { Contract } from '../contract/type';
import { createJsonApiRequest } from '../fetch/json';
import { HttpMethod, JsonApiRequestError } from '../fetch/api';
import {
  normalizeSourced,
  type DynamicallySourcedField,
  type SourcedField,
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

type RequestConfig<Params> = {
  url: SourcedField<Params, string>;
  credentials?: RequestCredentials;
  query?: SourcedField<Params, FetchApiRecord | string> | SourcedField<Params, string>;
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

interface BaseJsonQueryConfigNoParams<Data>
  extends SharedQueryFactoryConfig<Data> {
  request: RequestConfig<void>;
  concurrency?: ConcurrencyConfig;
}

interface BaseJsonQueryConfigWithParams<Params, Data>
  extends SharedQueryFactoryConfig<Data> {
  params: ParamsDeclaration<Params>;
  request: RequestConfig<Params>;
  concurrency?: ConcurrencyConfig;
}

// -- Overloads

// params + mapData
export function createJsonQuery<Params, Data, TransformedData>(
  config: BaseJsonQueryConfigWithParams<Params, TransformedData> & {
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: Params },
        TransformedData
      >;
      validate?: Validator<TransformedData, Params>;
    };
  }
): Query<Params, TransformedData, JsonApiRequestError>;

export function createJsonQuery<Params, Data, TransformedData>(
  config: BaseJsonQueryConfigWithParams<Params, TransformedData> & {
    initialData?: TransformedData;
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: Params },
        TransformedData
      >;
      validate?: Validator<TransformedData, Params>;
    };
  }
): Query<Params, TransformedData, JsonApiRequestError, TransformedData>;

// params + no mapData
export function createJsonQuery<Params, Data>(
  config: BaseJsonQueryConfigWithParams<Params, Data> & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, Params>;
    };
  }
): Query<Params, Data, JsonApiRequestError>;

export function createJsonQuery<Params, Data>(
  config: BaseJsonQueryConfigWithParams<Params, Data> & {
    initialData?: Data;
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, Params>;
    };
  }
): Query<Params, Data, JsonApiRequestError, Data>;

// No params + mapData
export function createJsonQuery<Data, TransformedData>(
  config: BaseJsonQueryConfigNoParams<TransformedData> & {
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: void },
        TransformedData
      >;
      validate?: Validator<TransformedData, void>;
    };
  }
): Query<void, TransformedData, JsonApiRequestError>;

export function createJsonQuery<Data, TransformedData>(
  config: BaseJsonQueryConfigNoParams<TransformedData> & {
    initialData?: TransformedData;
    response: {
      contract: Contract<unknown, Data>;
      mapData: DynamicallySourcedField<
        { result: Data; params: void },
        TransformedData
      >;
      validate?: Validator<TransformedData, void>;
    };
  }
): Query<void, TransformedData, JsonApiRequestError, TransformedData>;

// No params + no mapData
export function createJsonQuery<Data>(
  config: BaseJsonQueryConfigNoParams<Data> & {
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, void>;
    };
  }
): Query<void, Data, JsonApiRequestError>;

export function createJsonQuery<Data>(
  config: BaseJsonQueryConfigNoParams<Data> & {
    initialData?: Data;
    response: {
      contract: Contract<unknown, Data>;
      validate?: Validator<Data, void>;
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

  const headlessQuery = createHeadlessQuery<any, any, any, any, any, any>({
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
