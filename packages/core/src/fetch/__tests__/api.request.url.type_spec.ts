import { createStore } from 'effector';
import { expectAssignable, expectNotAssignable } from 'tsd';

import { createApiRequest } from '../api';

// Does not matter
const mapBody = () => 'any body';
const method = 'GET';
const credentials = 'same-origin';

// Does not matter
const response = {
  extract: async <T>(v: T) => v,
};

static_url: {
  const callApiFx = createApiRequest({
    request: { mapBody, credentials, url: 'https://api.salo.com', method },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({});
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({
    url: 'https://other-api.salo.com',
  });
}

reactive_url: {
  const $url = createStore('https://api.salo.com');

  const callApiFx = createApiRequest({
    request: { mapBody, credentials, url: $url, method },
    response,
  });

  expectAssignable<Parameters<typeof callApiFx>[0]>({});
  expectNotAssignable<Parameters<typeof callApiFx>[0]>({
    url: 'https://other-api.salo.com',
  });
}
