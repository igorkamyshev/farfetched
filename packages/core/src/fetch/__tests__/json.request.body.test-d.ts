import { createStore, Store } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createJsonApiRequest, Json } from '../json';

describe('createJsonApiRequest request.body', () => {
  // Does not matter
  const request = {
    method: 'POST' as const,
    url: 'https://api.salo.com',
    credentials: 'same-origin' as const,
  };

  test('disallow date in json', () => {
    const callJsonApiFx = createJsonApiRequest({ request });

    expectTypeOf(callJsonApiFx).toBeCallableWith({
      // @ts-expect-error should not allow Date
      body: { date: new Date() },
    });

    expectTypeOf(callJsonApiFx).toBeCallableWith({
      body: { date: new Date().toISOString() },
    });
  });
});
