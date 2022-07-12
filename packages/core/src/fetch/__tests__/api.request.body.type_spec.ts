import { createStore } from 'effector';
import { expectAssignable, expectNotAssignable } from 'tsd';

import { createApiRequest, RequestBody } from '../api';

// Does not matter
const noMap = <V>(v: V) => v;
const url = 'https://api.salo.com';
const credentials = 'same-origin';

// Does not matter
const response = {
  extract: async <T>(v: T) => v,
};

static_body: {
  const callApiFx = createApiRequest({
    request: {
      url,
      method: 'POST' as const,
      credentials,
      mapBody: noMap,
      body: 'Static body',
    },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({});
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({ body: 'string' });
}

reactive_body: {
  const $body = createStore<RequestBody>('First body');

  const callApiFx = createApiRequest({
    request: {
      url,
      method: 'POST' as const,
      credentials,
      mapBody: noMap,
      body: $body,
    },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({});
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({ body: 'string' });
}
