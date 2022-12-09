import { createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createApiRequest, RequestBody } from '../api';

describe('api request body', () => {
  const noMap = <V>(v: V) => v;
  const url = 'https://api.salo.com';
  const credentials = 'same-origin';
  const response = {
    extract: async <T>(v: T) => v,
  };

  test('static body', () => {
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

    expectTypeOf(callApiFx).toBeCallableWith({});

    // @ts-expect-error body is defined as string on creation
    expectTypeOf(callApiFx).toBeCallableWith({ body: 'string' });
  });

  test('reactive body', () => {
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

    expectTypeOf(callApiFx).toBeCallableWith({});

    // @ts-expect-error body is defined as string on creation
    expectTypeOf(callApiFx).toBeCallableWith({ body: 'string' });
  });
});
