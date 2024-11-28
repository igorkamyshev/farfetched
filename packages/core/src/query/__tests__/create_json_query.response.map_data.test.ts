import { setTimeout } from 'node:timers/promises';
import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { Contract } from '../../contract/type';
import { fetchFx } from '../../fetch/fetch';

describe('remote_data/query/json.response.map_data', () => {
  // Does not matter
  const validStringContract: Contract<unknown, string> = {
    isData: (raw): raw is string => true,

    getErrorMessages: () => [],
  };

  // Does not matter
  const request = {
    url: 'http://api.salo.com',
    method: 'GET' as const,
  };

  test('save data from response as is without callback', async () => {
    const response = Symbol('response');

    const query = createJsonQuery({
      request,
      response: { contract: validStringContract },
    });

    const fetchMock = vi.fn(() => response);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    await allSettled(query.start, { scope });

    expect(scope.getState(query.$data)).toBe(response);
  });

  test('save transformed data with simple callback', async () => {
    const response = Symbol('response');
    const transformed = Symbol('transformed');

    const query = createJsonQuery({
      request,
      response: {
        contract: unknownContract,
        mapData: ({ result, params }) => {
          expect(result).toBe(response);
          expect(params).toBe('caller params');

          return transformed;
        },
      },
      params: declareParams<string>(),
    });

    const fetchMock = vi.fn(() => response);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    await allSettled(query.start, { scope, params: 'caller params' });

    expect(scope.getState(query.$data)).toBe(transformed);
  });

  test('save transformed data with sourced callback', async () => {
    const response = Symbol('response');
    const transformed = Symbol('transformed');

    const $source = createStore('first');

    const query = createJsonQuery({
      request,
      response: {
        contract: unknownContract,
        mapData: {
          source: $source,
          fn: ({ result }, source) => {
            expect(result).toBe(response);
            expect(source).toBe('first');

            return transformed;
          },
        },
      },
    });

    const fetchMock = vi.fn(() => response);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    await allSettled(query.start, { scope });

    expect(scope.getState(query.$data)).toBe(transformed);
  });

  describe('metaResponse', () => {
    test('simple callback', async () => {
      const query = createJsonQuery({
        request,
        response: {
          contract: unknownContract,
          mapData: ({ result, headers }) => {
            expect(headers?.get('X-Test')).toBe('42');

            return result;
          },
        },
      });

      // We need to mock it on transport level
      // because we can't pass meta to executeFx
      const scope = fork({
        handlers: [
          [
            fetchFx,
            () =>
              new Response(JSON.stringify({}), {
                headers: { 'X-Test': '42' },
              }),
          ],
        ],
      });

      await allSettled(query.start, { scope });

      expect(scope.getState(query.$data)).toEqual({});
    });

    test('sourced callback', async () => {
      const query = createJsonQuery({
        request,
        response: {
          contract: unknownContract,
          mapData: {
            source: createStore(''),
            fn: ({ result, headers }, s) => {
              expect(headers?.get('X-Test')).toBe('42');

              return result;
            },
          },
        },
      });

      // We need to mock it on transport level
      // because we can't pass meta to executeFx
      const scope = fork({
        handlers: [
          [
            fetchFx,
            () =>
              new Response(JSON.stringify({}), {
                headers: { 'X-Test': '42' },
              }),
          ],
        ],
      });

      await allSettled(query.start, { scope });

      expect(scope.getState(query.$data)).toEqual({});
    });

    test('do not mix meta between calls', async () => {
      const query = createJsonQuery({
        params: declareParams<string>(),
        request: {
          url: (params) => `http://api.salo.com/${params}`,
          method: 'GET' as const,
        },
        response: {
          contract: unknownContract,
          mapData: ({ result, params, headers }) => {
            expect(headers?.get('X-Test')).toBe(
              `http://api.salo.com/${params}`
            );

            return result;
          },
        },
      });

      // We need to mock it on transport level
      // because we can't pass meta to executeFx
      const scope = fork({
        handlers: [
          [
            fetchFx,
            (req: Request) =>
              setTimeout(1).then(
                () =>
                  new Response(JSON.stringify({}), {
                    headers: { 'X-Test': req.url },
                  })
              ),
          ],
        ],
      });

      await Promise.all([
        allSettled(query.start, { scope, params: '1' }),
        allSettled(query.start, { scope, params: '2' }),
      ]);

      expect(scope.getState(query.$data)).toEqual({});
    });
  });
});
