import { attach, createEffect, createEvent, Event, sample } from 'effector';

import { abortable, AbortContext, AbortedError } from '../misc/abortable';
import { anySignal } from '../misc/any_signal';
import { normalizeStaticOrReactive, StaticOrReactive } from '../misc/sourced';
import {
  TimeoutController,
  TimeoutError,
} from '../misc/timeout_abort_controller';
import { NonOptionalKeys } from '../misc/ts';
import { formatUrl, mergeHeaders, mergeQuery } from '../misc/fetch_api';
import { HttpError, requestFx } from './request';

type HttpMethod =
  | 'HEAD'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'QUERY';

type RequestBody = Blob | BufferSource | FormData | string;

// These settings can be defined only statically
interface StaticOnlyRequestConfig<B> {
  method: StaticOrReactive<HttpMethod>;
  mapBody(body: B): RequestBody;
}

// These settings can be defined once — statically or dynamically
interface ExclusiveRequestConfigShared {
  url: string;
  credentials: RequestCredentials;
}

interface ExclusiveRequestConfig<B> extends ExclusiveRequestConfigShared {
  body?: B;
}

// These settings can be defined twice — both statically and dynamically, they will be merged
interface InclusiveRequestConfig {
  query?: URLSearchParams;
  headers?: HeadersInit;
}

type CreationRequestConfigShared<E> = {
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
}

interface ApiConfigShared {
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
     * Abort request after this number of milliseconds if it is not succeed yet
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

type ApiRequestError<P> =
  | AbortedError
  | TimeoutError
  | TypeError
  | HttpError
  | TimeoutError
  | ExtractionError<P>
  | PreparationError;

function createApiRequest<
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
    ApiRequestError<P>
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
        headers,
        credentials,
        body: mappedBody,
        signal: anySignal(abortController.signal, timeoutController?.signal),
      });

      const response = await requestFx(request).catch((cause) => {
        if (timeoutController?.signal.aborted) {
          throw new TimeoutError(timeoutController.timeout);
        }

        throw cause;
      });

      const prepared = await prepareFx(response).catch((cause) => {
        throw new PreparationError(response, cause);
      });

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

      const query = mergeQuery(staticConfig.query, dynamicConfig.query);
      const headers = mergeHeaders(staticConfig.headers, dynamicConfig.headers);

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
    ApiRequestError<P>
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

/**
 * `prepare.extract` throws error, so preparation is impossible
 */
class PreparationError extends Error {
  constructor(
    /** Original response */
    readonly response: Response,
    cause: Error
  ) {
    super(`Cannot prepare response`, { cause });
  }
}

/**
 * `data.extract`, `error.extract` or `error.is` throws error, so extraction is impossible
 */
class ExtractionError<P> extends Error {
  constructor(
    /** Prepared response */
    readonly prepared: P,
    /** Field with failed extraction */
    readonly field: 'error' | 'data',
    cause: Error
  ) {
    super(`Cannot extract ${field} from response`, { cause });
  }
}

export {
  createApiRequest,
  ExtractionError,
  PreparationError,
  type HttpMethod,
  type RequestBody,
  type ApiConfigShared,
  type CreationRequestConfigShared,
  type ExclusiveRequestConfigShared,
  type StaticOnlyRequestConfig,
  type ApiRequestError,
};
