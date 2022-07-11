import { createStore } from 'effector';
import { expectAssignable, expectNotAssignable } from 'tsd';

import { createApiRequest } from '../api';

// Does not matter
const mapBody = () => 'any body';
const url = 'https://api.salo.com';
const method = 'GET';

// Does not matter
const response = {
  extract: async <T>(v: T) => v,
};

static_credentials: {
  const callApiFx = createApiRequest({
    request: { mapBody, credentials: 'omit' as const, method, url },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({});
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({
    credentials: 'same-origin',
  });
}

reactive_credentials: {
  const $credentials = createStore<RequestCredentials>('omit');

  const callApiFx = createApiRequest({
    request: { mapBody, credentials: $credentials, method, url },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({});
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({
    credentials: 'same-origin',
  });
}
