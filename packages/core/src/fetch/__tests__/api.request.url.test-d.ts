import { createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createApiRequest } from '../api';

describe('createApiRequest request.url', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const method = 'GET';
  const credentials = 'same-origin';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('static url', () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials, url: 'https://api.salo.com', method },
      response,
    });

    expectTypeOf(callApiFx).toBeCallableWith({});
    expectTypeOf(callApiFx).toBeCallableWith({
      // @ts-expect-error should be callable without url
      url: 'https://other-api.salo.com',
    });
  });

  test('reactive url', () => {
    const $url = createStore('https://api.salo.com');

    const callApiFx = createApiRequest({
      request: { mapBody, credentials, url: $url, method },
      response,
    });

    expectTypeOf(callApiFx).toBeCallableWith({});
    expectTypeOf(callApiFx).toBeCallableWith({
      // @ts-expect-error should be callable without url
      url: 'https://other-api.salo.com',
    });
  });
});
