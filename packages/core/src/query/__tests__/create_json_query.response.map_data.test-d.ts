import { createStore } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { declareParams } from '../../remote_operation/params';
import { createJsonQuery } from '../create_json_query';

describe('createJsonQuery', () => {
  describe('mapData', () => {
    test('callback', () => {
      createJsonQuery({
        params: declareParams<string>(),
        request: { url: 'http://api.salo.com', method: 'GET' as const },
        response: {
          contract: unknownContract,
          mapData: ({ result, params }) => {
            expectTypeOf(result).toEqualTypeOf<unknown>();
            expectTypeOf(params).toEqualTypeOf<string>();

            return 12;
          },
        },
      });
    });

    test('stora and callbacl', () => {
      createJsonQuery({
        request: { url: 'http://api.salo.com', method: 'GET' as const },
        response: {
          contract: unknownContract,
          mapData: {
            source: createStore(12),
            fn: ({ result, params }, source) => {
              expectTypeOf(result).toEqualTypeOf<unknown>();
              expectTypeOf(params).toEqualTypeOf<string>();
              expectTypeOf(source).toEqualTypeOf<number>();
              return 12;
            },
          },
        },
        params: declareParams<string>(),
      });
    });
  });
});
