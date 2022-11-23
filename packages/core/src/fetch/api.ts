import { attach, createEffect, createEvent, Event, sample } from 'effector';

import {
  abortable,
  AbortContext,
  normalizeStaticOrReactive,
  StaticOrReactive,
} from '../libs/patronus';
import { NonOptionalKeys } from '../libs/lohyphen';
import {
  AbortError,
  HttpError,
  NetworkError,
  PreparationError,
  TimeoutError,
} from '../errors/type';
import {
  timeoutError,
  preparationError,
  invalidDataError,
} from '../errors/create_error';
import { anySignal } from './any_signal';
import { TimeoutController } from './timeout_abort_controller';
import {
  formatUrl,
  mergeRecords,
  formatHeaders,
  type FetchApiRecord,
} from './lib';
import { requestFx } from './request';

export type HttpMethod =
  | 'HEAD'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'QUERY';

export type RequestBody = Blob | BufferSource | FormData | string;

// These settings can be defined only statically
export interface StaticOnlyRequestConfig<B> {
  method: StaticOrReactive<HttpMethod>;
  mapBody(body: B): RequestBody;
}

// These settings can be defined once — statically or dynamically
export interface ExclusiveRequestConfigShared {
  url: string;
  credentials: RequestCredentials;
}

export interface ExclusiveRequestConfig<B>
  extends ExclusiveRequestConfigShared {
  body?: B;
}

// These settings can be defined twice — both statically and dynamically, they will be merged
export interface InclusiveRequestConfig {
  query?: FetchApiRecord;
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
  /** Configuration of allowed response statuses */
  status?: {
    expected: number | number[];
  };
}

export interface ApiConfigShared {
  /**
   * Rules to handle concurrent executions of the same request
   */
  concurrency?: {
    /**
     * Auto-cancelation strategy
     * - `TAKE_EVERY` will not cancel any requests
     * - `TAKE_LATEST` will cancel all but the latest request
     *
     * @default "TAKE_EVERY"
     */
    strategy?: 'TAKE_LATEST' | 'TAKE_EVERY';
  };

  /**
   * Rules to abort request
   */
  abort?: {
    /**
     * All requests will be aborted on this event call
     */
    clock?: Event<any>;
    /**
     * Abort request after this number of milliseconds if it is not succeeded yet
     */
    timeout?: StaticOrReactive<number>;
  };
}

interface ApiConfig<B, R extends CreationRequestConfig<B>, P>
  extends ApiConfigShared {
  /** Rules to create Request */
  request: R;
  /** Rules to handle Response */
  response: ApiConfigResponse<P>;
}

export type ApiRequestError =
  | AbortError
  | TimeoutError
  | PreparationError
  | NetworkError
  | HttpError;

export function createApiRequest<
  R extends CreationRequestConfig<B>,
  P,
  B = RequestBody
>(config: ApiConfig<B, R, P>) {
  type ApiRequestParams = Omit<ExclusiveRequestConfig<B>, NonOptionalKeys<R>> &
    InclusiveRequestConfig;
  type ApiRequestResult = P;

  const prepareFx = createEffect(config.response.extract);

  const apiRequestFx = createEffect<
    DynamicRequestConfig<B> &
      AbortContext & { timeoutController: TimeoutController | null } & {
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
      onAbort,
      timeoutController,
    }) => {
      // This abort controller uses for `abortable`, it cancell all requests
      const abortController = new AbortController();
      onAbort(() => {
        abortController.abort();
      });

      const mappedBody = body ? config.request.mapBody(body) : null;

      const request = new Request(formatUrl(url, query), {
        method,
        headers: formatHeaders(headers),
        credentials,
        body: mappedBody,
        signal: anySignal(abortController.signal, timeoutController?.signal),
      });

      const response = await requestFx(request).catch((cause) => {
        if (timeoutController?.signal.aborted) {
          throw timeoutError({ timeout: timeoutController.timeout });
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
          });
        }
      }

      return prepared;
    }
  );

  const boundApiRequestFx = attach({
    source: {
      url: normalizeStaticOrReactive(config.request.url),
      method: normalizeStaticOrReactive(config.request.method),
      query: normalizeStaticOrReactive(config.request.query),
      headers: normalizeStaticOrReactive(config.request.headers),
      credentials: normalizeStaticOrReactive(config.request.credentials),
      body: normalizeStaticOrReactive(config.request.body),
      timeout: normalizeStaticOrReactive(config.abort?.timeout),
    },
    mapParams(dynamicConfig: ApiRequestParams & AbortContext, staticConfig) {
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

      const query = mergeRecords(staticConfig.query, dynamicConfig.query);
      const headers = mergeRecords(staticConfig.headers, dynamicConfig.headers);

      // Other settings
      const { method } = staticConfig;
      const { onAbort } = dynamicConfig;

      // This abort controller uses for timeout, it cancell only one request
      // so we have to create it dynamically
      const timeoutController = staticConfig.timeout
        ? new TimeoutController(staticConfig.timeout)
        : null;

      return {
        url,
        method: method!, // TODO: fix type inference here
        query,
        headers,
        credentials,
        body,
        onAbort,
        timeoutController,
      };
    },
    effect: apiRequestFx,
  });

  const abortSignal = createEvent();

  const boundAbortableApiRequestFx = abortable<
    ApiRequestParams,
    ApiRequestResult,
    ApiRequestError
  >({
    abort: { signal: abortSignal },
    effect(params, abortContext) {
      return boundApiRequestFx({ ...params, ...abortContext });
    },
  });

  // Apply concurrency and abort settings

  if (config.abort?.clock) {
    sample({ clock: config.abort.clock, target: abortSignal });
  }

  switch (config.concurrency?.strategy) {
    case 'TAKE_LATEST':
      sample({ clock: boundAbortableApiRequestFx, target: abortSignal });
      break;
    case 'TAKE_EVERY':
      // Do not have to do anything here
      break;
    default:
    // Do nothing
  }

  return boundAbortableApiRequestFx;
}
