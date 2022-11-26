import { createStore } from 'effector';
import { expectTypeOf, describe, test } from 'vitest';

import { createApiRequest } from '../api';

describe('createApiRequest request.credentials', () => {
  // Does not matter
  const mapBody = () => 'any body';
  const url = 'https://api.salo.com';
  const method = 'GET';

  // Does not matter
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('static credentials', () => {
    const callApiFx = createApiRequest({
      request: { mapBody, credentials: 'omit' as const, method, url },
      response,
    });

    expectTypeOf(callApiFx).toBeCallableWith({});
    // @ts-expect-error should be callable without credentials
    expectTypeOf(callApiFx).toBeCallableWith({ credentials: 'same-origin' });
  });

  test('reactive credentials', () => {
    const $credentials = createStore<RequestCredentials>('omit');

    const callApiFx = createApiRequest({
      request: { mapBody, credentials: $credentials, method, url },
      response,
    });

    expectTypeOf(callApiFx).toBeCallableWith({});
    // @ts-expect-error should be callable without credentials
    expectTypeOf(callApiFx).toBeCallableWith({ credentials: 'same-origin' });
  });
});
