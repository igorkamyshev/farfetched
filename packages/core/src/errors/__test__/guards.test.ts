import { describe, test, expect } from 'vitest';
import { httpError } from '../create_error';

import { isHttpErrorCode } from '../guards';

describe('isHttpErrorCode', () => {
  test('isHttpErrorCode supports array of codes', () => {
    const check401or403 = isHttpErrorCode([401, 403]);

    expect(
      check401or403({
        error: httpError({
          status: 401,
          statusText: 'Text',
          response: {},
        }),
      })
    ).toBe(true);

    expect(
      check401or403({
        error: httpError({
          status: 403,
          statusText: 'Text',
          response: {},
        }),
      })
    ).toBe(true);

    expect(
      check401or403({
        error: httpError({
          status: 400,
          statusText: 'Text',
          response: {},
        }),
      })
    ).toBe(false);

    expect(
      check401or403({
        error: httpError({
          status: 404,
          statusText: 'Text',
          response: {},
        }),
      })
    ).toBe(false);
  });
});
