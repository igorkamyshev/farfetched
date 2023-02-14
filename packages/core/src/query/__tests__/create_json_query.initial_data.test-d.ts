import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../../contract/type';
import { JsonApiRequestError } from '../../fetch/api';
import { declareParams } from '../../remote_operation/params';
import { createJsonQuery } from '../create_json_query';
import { Query } from '../type';

describe('createJsonQuery', () => {
  test('infer initial data with params and mapData', () => {
    const query = createJsonQuery({
      params: declareParams<number>(),
      initialData: '14',
      request: { url: 'https://example.com', method: 'GET' },
      response: {
        mapData: ({ result }) => result.toString(),
        contract: {} as Contract<unknown, number>,
      },
    });

    expectTypeOf(query).toEqualTypeOf<
      Query<number, string, JsonApiRequestError, string>
    >();
    // @ts-expect-error invalid initial initial data type
    expectTypeOf(query).toEqualTypeOf<
      Query<number, string, JsonApiRequestError>
    >();
  });

  test('infer initial data with params and no mapData', () => {
    const query = createJsonQuery({
      params: declareParams<number>(),
      initialData: '14',
      request: { url: 'https://example.com', method: 'GET' },
      response: {
        contract: {} as Contract<unknown, string>,
      },
    });

    expectTypeOf(query).toEqualTypeOf<
      Query<number, string, JsonApiRequestError, string>
    >();
    // @ts-expect-error invalid initial initial data type
    expectTypeOf(query).toEqualTypeOf<
      Query<number, string, JsonApiRequestError>
    >();
  });

  test('infer initial data with no params and mapData', () => {
    const query = createJsonQuery({
      initialData: '14',
      request: { url: 'https://example.com', method: 'GET' },
      response: {
        mapData: ({ result }) => result.toString(),
        contract: {} as Contract<unknown, number>,
      },
    });

    expectTypeOf(query).toEqualTypeOf<
      Query<void, string, JsonApiRequestError, string>
    >();
    // @ts-expect-error invalid initial initial data type
    expectTypeOf(query).toEqualTypeOf<
      Query<void, string, JsonApiRequestError>
    >();
  });

  test('infer initial data with no params and no mapData', () => {
    const query = createJsonQuery({
      initialData: '14',
      request: { url: 'https://example.com', method: 'GET' },
      response: {
        contract: {} as Contract<unknown, string>,
      },
    });

    expectTypeOf(query).toEqualTypeOf<
      Query<void, string, JsonApiRequestError, string>
    >();
    // @ts-expect-error invalid initial initial data type
    expectTypeOf(query).toEqualTypeOf<
      Query<void, string, JsonApiRequestError>
    >();
  });
});
