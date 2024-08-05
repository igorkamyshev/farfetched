/**
 * @vitest-environment jsdom
 */
import { describe, test, expect } from 'vitest';
import { allSettled, fork } from 'effector';

import { createJsonQuery } from '../query/create_json_query';
import { unknownContract } from '../contract/unknown_contract';
import { fetchFx } from '../fetch/fetch';

describe('relative paths in createJsonQuery, issue #493', () => {
  test('does not throw error for valid relative path', async () => {
    const query = createJsonQuery({
      request: { url: '/api', method: 'GET' },
      response: { contract: unknownContract },
    });

    const scope = fork({
      // We have to to mock fetchFx, because URL validation embed in createJsonQuery.__.executeFx
      handlers: [[fetchFx, () => new Response(JSON.stringify('DATA'))]],
    });

    await allSettled(query.start, { scope });

    expect(scope.getState(query.$error)).toBe(null);
    expect(scope.getState(query.$data)).toBe('DATA');
  });

  test('does throw error for invalid relative path', async () => {
    const query = createJsonQuery({
      request: { url: 'api **** jkjj', method: 'GET' },
      response: { contract: unknownContract },
    });

    const scope = fork({
      // We have to to mock fetchFx, because URL validation embed in createJsonQuery.__.executeFx
      handlers: [[fetchFx, () => new Response(JSON.stringify('DATA'))]],
    });

    await allSettled(query.start, { scope });

    expect(scope.getState(query.$error)).toMatchInlineSnapshot(`
      {
        "errorType": "CONFIGURATION",
        "explanation": "Operation is misconfigured",
        "reason": "Invalid URL",
        "validationErrors": [
          ""api **** jkjj" is not valid URL",
        ],
      }
    `);
    expect(scope.getState(query.$data)).toBe(null);
  });
});
