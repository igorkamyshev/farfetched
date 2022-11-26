import { createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { Contract } from '../../contract/type';

describe('createJsonQuery', () => {
  const numberContract = {} as Contract<unknown, number>;

  describe('validate', () => {
    test('no params, callback', () => {
      createJsonQuery({
        request: {
          method: 'GET' as const,
          url: 'http://api.salo.com',
        },
        response: {
          contract: numberContract,
          validate: ({ result, params }) => {
            expectTypeOf(result).toEqualTypeOf<number>();
            expectTypeOf(params).toEqualTypeOf<void>();
            return true;
          },
        },
      });
    });

    test('no params, store and callback', () => {
      createJsonQuery({
        request: {
          method: 'GET' as const,
          url: 'http://api.salo.com',
        },
        response: {
          contract: numberContract,
          validate: {
            source: createStore(false),
            fn: ({ result, params }, s) => {
              expectTypeOf(result).toEqualTypeOf<number>();
              expectTypeOf(params).toEqualTypeOf<void>();
              expectTypeOf(s).toEqualTypeOf<boolean>();
              return true;
            },
          },
        },
      });
    });

    test('params, callback', () => {
      createJsonQuery({
        params: declareParams<string>(),
        request: {
          method: 'GET' as const,
          url: 'http://api.salo.com',
        },
        response: {
          contract: numberContract,
          validate: ({ result, params }) => {
            expectTypeOf(result).toEqualTypeOf<number>();
            expectTypeOf(params).toEqualTypeOf<string>();
            return true;
          },
        },
      });
    });

    test('params, store and callback', () => {
      createJsonQuery({
        params: declareParams<string>(),
        request: {
          method: 'GET' as const,
          url: 'http://api.salo.com',
        },
        response: {
          contract: numberContract,
          validate: {
            source: createStore(false),
            fn: ({ result, params }, s) => {
              expectTypeOf(result).toEqualTypeOf<number>();
              expectTypeOf(params).toEqualTypeOf<string>();
              expectTypeOf(s).toEqualTypeOf<boolean>();
              return true;
            },
          },
        },
      });
    });
  });
});
