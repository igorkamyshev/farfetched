import { combine } from 'effector';

import {
  ApiConfigShared,
  createApiRequest,
  CreationRequestConfigShared,
  ExclusiveRequestConfigShared,
  StaticOnlyRequestConfig,
} from './api';
import { normalizeStaticOrReactive } from '../libs/patronus';
import { mergeRecords } from './lib';

type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[];

type JsonObject = Record<string, Json>;

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

function createJsonApiRequest<R extends CreationRequestConfig>(
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
        if (!response.body) {
          return null;
        }

        return response.json();
      },
      status: config.response?.status,
    },
  });

  return jsonApiCallFx;
}

export { createJsonApiRequest, type Json, type JsonObject };
