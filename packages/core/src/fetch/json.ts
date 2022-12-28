import { combine, type Json } from 'effector';

import { httpError } from '../errors/create_error';
import { isHttpError } from '../errors/guards';
import { HttpError } from '../errors/type';

import { normalizeStaticOrReactive } from '../libs/patronus';
import {
  ApiConfigShared,
  createApiRequest,
  CreationRequestConfigShared,
  ExclusiveRequestConfigShared,
  StaticOnlyRequestConfig,
} from './api';
import { mergeRecords } from './lib';

export type JsonObject = Record<string, Json>;

interface ExclusiveRequestConfig extends ExclusiveRequestConfigShared {
  body?: Json;
}

type CreationRequestConfig =
  CreationRequestConfigShared<ExclusiveRequestConfig> &
    Omit<StaticOnlyRequestConfig<any>, 'mapBody'>;

interface JsonApiConfig<R extends CreationRequestConfig>
  extends ApiConfigShared {
  request: R;
  response?: { status?: { expected: number | number[] } };
}

export function createJsonApiRequest<R extends CreationRequestConfig>(
  config: JsonApiConfig<R>
) {
  // Add default application/json header to every request
  const $headers = combine(
    {
      method: normalizeStaticOrReactive(config.request.method),
      headers: normalizeStaticOrReactive(config.request.headers),
    },
    ({ method, headers }) =>
      ['GET', 'HEAD'].includes(method!) // TODO: fix type inferences
        ? headers
        : mergeRecords(headers, {
            'Content-Type': 'application/json',
          })
  );

  const jsonApiCallFx = createApiRequest<
    /* Request config, it does not include mapBody, so let's add it */ R & {
      mapBody: (jsonBody: Json) => string;
    },
    /* Result of preparation */ unknown,
    /* Allowed body */ Json
  >({
    ...config,
    request: {
      ...config.request,
      headers: $headers,
      // Serialize body to JSON-string
      mapBody: (jsonBody) => JSON.stringify(jsonBody),
    },
    response: {
      extract: async (response) => {
        const emptyContent = response.headers.get('Content-Length') === '0';

        if (!response.body || emptyContent) {
          return null;
        }

        return response.json();
      },
      transformError: (error) => {
        if (!isHttpError({ error })) {
          return error;
        }

        const errorAsHttpError = error as HttpError;

        if (typeof errorAsHttpError.response !== 'string') {
          return errorAsHttpError;
        }

        try {
          const parsedError = JSON.parse(errorAsHttpError.response);

          return httpError({
            status: errorAsHttpError.status,
            statusText: errorAsHttpError.statusText,
            response: parsedError,
          });
        } catch (e) {
          return errorAsHttpError;
        }
      },
      status: config.response?.status,
    },
  });

  return jsonApiCallFx;
}
