import { describe, test, expectTypeOf } from 'vitest';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { Contract } from '../../contract/type';

describe('createJsonQuery', () => {
  describe('params', () => {
    // Does not matter
    const response = {
      contract: {} as Contract<unknown, unknown>,
      mapData: <T>(v: T) => v,
    };

    // Does not matter
    const request = {
      url: 'http://api.salo.com',
      method: 'GET' as const,
    };

    test('no params, no mapData', () => {
      const query = createJsonQuery({
        request,
        response,
      });

      expectTypeOf(query.start).toBeCallableWith();
    });

    test('no params, mapData', () => {
      const query = createJsonQuery({
        request,
        response: {
          ...response,
          mapData() {
            // Does not matter
            return 1;
          },
        },
      });

      expectTypeOf(query.start).toBeCallableWith();
    });

    test('params, no mapData', () => {
      const queryWithString = createJsonQuery({
        params: declareParams<string>(),
        request,
        response,
      });

      expectTypeOf(queryWithString.start).toBeCallableWith('string');

      const queryWithStringOrNumber = createJsonQuery({
        params: declareParams<string | number>(),
        request,
        response,
      });

      expectTypeOf(queryWithStringOrNumber.start).toBeCallableWith('string');
      expectTypeOf(queryWithStringOrNumber.start).toBeCallableWith(12);

      const queryWithObject = createJsonQuery({
        params: declareParams<{ at: Date }>(),
        request,
        response,
      });

      expectTypeOf(queryWithObject.start).toBeCallableWith({ at: new Date() });
    });

    test('params, mapData', () => {
      const queryWithString = createJsonQuery({
        params: declareParams<string>(),
        request,
        response: {
          ...response,
          mapData() {
            // Does not matter
            return 1;
          },
        },
      });

      expectTypeOf(queryWithString.start).toBeCallableWith('string');

      const queryWithStringOrNumber = createJsonQuery({
        params: declareParams<string | number>(),
        request,
        response: {
          ...response,
          mapData() {
            // Does not matter
            return 1;
          },
        },
      });

      expectTypeOf(queryWithStringOrNumber.start).toBeCallableWith('string');
      expectTypeOf(queryWithStringOrNumber.start).toBeCallableWith(12);

      const queryWithObject = createJsonQuery({
        params: declareParams<{ at: Date }>(),
        request,
        response: {
          ...response,
          mapData() {
            // Does not matter
            return 1;
          },
        },
      });

      expectTypeOf(queryWithObject.start).toBeCallableWith({ at: new Date() });
    });
  });
});
