import { attach, createEffect } from 'effector';

import { normalizeStaticOrReactive, StaticOrReactive } from '../libs/patronus';
import { NonOptionalKeys } from '../libs/lohyphen';
import {
  ConfigurationError,
  HttpError,
  InvalidDataError,
  NetworkError,
  PreparationError,
  TimeoutError,
} from '../errors/type';
import { preparationError, invalidDataError } from '../errors/create_error';
import {
  formatUrl,
  mergeRecords,
  formatHeaders,
  type FetchApiRecord,
  mergeQueryStrings,
} from './lib';
import { requestFx } from './request';

export type HttpMethod =
  | 'HEAD'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'QUERY'
  | 'OPTIONS';

export type RequestBody = Blob | BufferSource | FormData | string;

// These settings can be defined only statically
export interface StaticOnlyRequestConfig<B> {
  method: StaticOrReactive<HttpMethod>;
  mapBody(body: B): RequestBody;
}

// These settings can be defined once — statically or dynamically
export interface ExclusiveRequestConfigShared {
  url: string;
  credentials?: RequestCredentials;
  abortController?: AbortController;
}

export interface ExclusiveRequestConfig<B>
  extends ExclusiveRequestConfigShared {
  body?: B;
}

// These settings can be defined twice — both statically and dynamically, they will be merged
export interface InclusiveRequestConfig {
  query?: FetchApiRecord | string;
  headers?: FetchApiRecord;
}

export type CreationRequestConfigShared<E> = {
  [key in keyof E]?: StaticOrReactive<E[key]>;
} & {
  [key in keyof InclusiveRequestConfig]?: StaticOrReactive<
    InclusiveRequestConfig[key]
  >;
};

type CreationRequestConfig<B> = CreationRequestConfigShared<
  ExclusiveRequestConfig<B>
> &
  StaticOnlyRequestConfig<B>;

type DynamicRequestConfig<B> = ExclusiveRequestConfig<B> &
  Required<InclusiveRequestConfig>;

interface ApiConfigResponse<P> {
  /**
   * Transforms Response
   *
   * @example
   *
   * const callApiFx = createApiRequest({
   *   prepare: { extract: (response) => response.json() },
   * })
   */
  extract: (response: Response) => Promise<P>;
  transformError?: (
    error: NetworkError | HttpError
  ) => NetworkError | HttpError;
  /** Configuration of allowed response statuses */
  status?: {
    expected: number | number[];
  };
}

interface ApiConfig<B, R extends CreationRequestConfig<B>, P> {
  /** Rules to create Request */
  request: R;
  /** Rules to handle Response */
  response: ApiConfigResponse<P>;
}

export type ApiRequestError =
  | ConfigurationError
  | TimeoutError
  | PreparationError
  | NetworkError
  | HttpError;

export type JsonApiRequestError = ApiRequestError | InvalidDataError;

export function createApiRequest<
  R extends CreationRequestConfig<B>,
  P,
  B = RequestBody,
>(config: ApiConfig<B, R, P>) {
  type ApiRequestParams = Omit<ExclusiveRequestConfig<B>, NonOptionalKeys<R>> &
    InclusiveRequestConfig;
  type ApiRequestResult = P;

  const prepareFx = createEffect(config.response.extract);

  const apiRequestFx = createEffect<
    DynamicRequestConfig<B> & {
      method: HttpMethod;
    },
    ApiRequestResult,
    ApiRequestError
  >(
    async ({
      url,
      method,
      query,
      headers,
      credentials,
      body,
      abortController,
    }) => {
      const mappedBody = body ? config.request.mapBody(body) : null;

      const request = new Request(formatUrl(url, query), {
        method,
        headers: formatHeaders(headers),
        credentials,
        body: mappedBody,
        signal: abortController?.signal,
      });

      const response = await requestFx(request).catch((cause) => {
        if (config.response.transformError) {
          throw config.response.transformError(cause);
        }

        throw cause;
      });

      // We cannot read body of the response twice (prepareFx and throw preparationError)
      const clonedResponse = response.clone();

      const prepared = await prepareFx(response).catch(async (cause) => {
        throw preparationError({
          response: await clonedResponse.text(),
          reason: cause?.message ?? null,
        });
      });

      if (config.response.status) {
        const expected = Array.isArray(config.response.status.expected)
          ? config.response.status.expected
          : [config.response.status.expected];

        if (!expected.includes(response.status)) {
          throw invalidDataError({
            validationErrors: [
              `Expected response status has to be one of [${expected.join(
                ', '
              )}], got ${response.status}`,
            ],
            response: prepared,
          });
        }
      }

      return prepared;
    }
  );

  return attach({
    source: {
      url: normalizeStaticOrReactive(config.request.url),
      method: normalizeStaticOrReactive(config.request.method),
      query: normalizeStaticOrReactive(config.request.query),
      headers: normalizeStaticOrReactive(config.request.headers),
      credentials: normalizeStaticOrReactive(config.request.credentials),
      body: normalizeStaticOrReactive(config.request.body),
    },
    mapParams(dynamicConfig: ApiRequestParams, staticConfig) {
      // Exclusive settings

      const url: string =
        staticConfig.url ??
        // @ts-expect-error TS cannot infer type correctly, but there is always field in staticConfig or dynamicConfig
        dynamicConfig.url;

      const credentials: RequestCredentials =
        staticConfig.credentials ??
        // @ts-expect-error TS cannot infer type correctly, but there is always field in staticConfig or dynamicConfig
        dynamicConfig.credentials;

      const body: B =
        staticConfig.body ??
        // @ts-expect-error TS cannot infer type correctly, but there is always field in staticConfig or dynamicConfig
        dynamicConfig.body;

      // Inclusive settings

      const query = mergeQueryStrings(staticConfig.query, dynamicConfig.query);
      const headers = mergeRecords(staticConfig.headers, dynamicConfig.headers);

      // Other settings
      const { method } = staticConfig;
      // @ts-expect-error
      const { abortController } = dynamicConfig;

      return {
        url,
        method: method!, // TODO: fix type inference here
        query,
        headers,
        credentials,
        body,
        abortController,
      };
    },
    effect: apiRequestFx,
  });
}
