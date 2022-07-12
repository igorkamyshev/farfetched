import { createStore } from 'effector';
import { expectAssignable, expectNotAssignable } from 'tsd';

import { createApiRequest, HttpMethod } from '../api';

// Does not matter
const mapBody = () => 'any body';
const url = 'https://api.salo.com';
const credentials = 'same-origin';

// Does not matter
const response = {
  extract: async <T>(v: T) => v,
};

static_method: {
  const callApiFx = createApiRequest({
    request: { mapBody, credentials, method: 'QUERY' as const },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({ url });
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({
    url,
    method: 'GET' as const,
  });
}

reactive_method: {
  const $method = createStore<HttpMethod>('GET');

  const callApiFx = createApiRequest({
    request: { mapBody, credentials, method: $method },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({ url });
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({
    url,
    method: 'GET' as const,
  });
}
