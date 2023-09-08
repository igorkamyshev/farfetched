import { createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { unknownContract } from '../../contract/unknown_contract';
import { sourced } from '../../libs/patronus';

describe('createJsonQuery', () => {
  describe('sourced fields', () => {
    test('no params, callback', () => {
      createJsonQuery({
        response: { contract: unknownContract },
        request: {
          method: 'GET' as const,
          url: (p) => {
            expectTypeOf(p).toEqualTypeOf<void>();
            return 'http://api.salo.com';
          },
        },
      });
    });

    test('no params, store', () => {
      createJsonQuery({
        response: { contract: unknownContract },
        request: {
          method: 'GET' as const,
          url: createStore('http://api.salo.com'),
        },
      });
    });

    test('no params, store and callback', () => {
      createJsonQuery({
        response: { contract: unknownContract },
        request: {
          method: 'GET' as const,
          url: sourced({
            source: createStore('http://api.salo.com'),
            fn(params, source) {
              expectTypeOf(params).toEqualTypeOf<void>();
              expectTypeOf(source).toEqualTypeOf<string>();
              return source;
            },
          }),
        },
      });
    });

    test('params, callback', () => {
      createJsonQuery({
        params: declareParams<string>(),
        response: { contract: unknownContract },
        request: {
          method: 'GET' as const,
          url: (params) => {
            expectTypeOf(params).toEqualTypeOf<string>();
            return 'http://api.salo.com';
          },
        },
      });
    });

    test('params, store', () => {
      createJsonQuery({
        params: declareParams<string>(),
        response: { contract: unknownContract },
        request: {
          method: 'GET' as const,
          url: createStore('http://api.salo.com'),
        },
      });
    });

    test('params, store and callback', () => {
      createJsonQuery({
        params: declareParams<string>(),
        response: { contract: unknownContract },
        request: {
          method: 'GET' as const,
          url: sourced({
            source: createStore(12),
            fn: (params, source) => {
              expectTypeOf(params).toEqualTypeOf<string>();
              expectTypeOf(source).toEqualTypeOf<number>();
              return 'http://api.salo.com';
            },
          }),
        },
      });
    });
  });
});
