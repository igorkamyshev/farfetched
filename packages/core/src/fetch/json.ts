import { combine, type Json } from 'effector';

import { httpError } from '../errors/create_error';
import { isHttpError } from '../errors/guards';
import { HttpError } from '../errors/type';

import { normalizeStaticOrReactive } from '../libs/patronus';
import {
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

interface JsonApiConfig<R extends CreationRequestConfig> {
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
      // reversed merge order to allow any modifications in the user code
      mergeRecords(
        {
          Accept: 'application/json',
          'Content-Type': ['GET', 'HEAD'].includes(method)
            ? undefined
            : 'application/json',
        },
        headers
      )
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
        const emptyContent = await isEmptyResponse(response);

        if (emptyContent) {
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

async function isEmptyResponse(response: Response): Promise<boolean> {
  if (!response.body) {
    return true;
  }

  const headerAsEmpty = response.headers.get('Content-Length') === '0';
  if (headerAsEmpty) {
    return true;
  }

  // Clone response to read it
  // because response can be read only once
  const clonnedResponse = response.clone();
  const bodyAsText = await clonnedResponse.text();
  if (bodyAsText.length === 0) {
    return true;
  }

  return false;
}
