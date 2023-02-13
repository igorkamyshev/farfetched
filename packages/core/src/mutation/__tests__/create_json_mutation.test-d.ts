import { createStore, Event } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../../contract/type';
import { unknownContract } from '../../contract/unknown_contract';
import { ExecutionMeta } from '../../remote_operation/type';
import { declareParams } from '../../remote_operation/params';
import { createJsonMutation } from '../create_json_mutation';
import { Mutation } from '../type';
import { DefaultRequestError } from '../../fetch/api';

describe('createJsonMutation', () => {
  test('no params and no body in GET', () => {
    const mutation = createJsonMutation({
      request: {
        url: 'api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutation.start).toBeCallableWith();
    // @ts-expect-error should not be callable with params
    expectTypeOf(mutation.start).toBeCallableWith({});

    const invalidMutation = createJsonMutation({
      request: {
        url: 'api.salo.com',
        method: 'GET' as const,
        // @ts-expect-error body is not allowed for GET
        body: {},
      },
      response: { contract: unknownContract },
    });
  });

  test('no params and optional body in POST', () => {
    const mutationWithBody = createJsonMutation({
      request: {
        url: '',
        method: 'POST' as const,
        body: {},
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutationWithBody.start).toBeCallableWith();
    // @ts-expect-error should not be callable with params
    expectTypeOf(mutationWithBody.start).toBeCallableWith({});

    const mutationNoBody = createJsonMutation({
      request: {
        url: '',
        method: 'POST' as const,
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutationNoBody.start).toBeCallableWith();
    // @ts-expect-error should not be callable with params
    expectTypeOf(mutationNoBody.start).toBeCallableWith({});
  });

  test('explicit params and no body in GET', () => {
    const mutation = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutation.start).toBeCallableWith(1);
    // @ts-expect-error should be callable with number
    expectTypeOf(mutation.start).toBeCallableWith({ params: 1 });

    const invalidMutation = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
        // @ts-expect-error body is not allowed for GET
        body: {},
      },
      response: { contract: unknownContract },
    });
  });

  test('explicit params and optional body in POST', () => {
    const mutationWithBody = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'POST' as const,
        body: {},
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutationWithBody.start).toBeCallableWith(1);
    // @ts-expect-error should be callable with number
    expectTypeOf(mutationWithBody.start).toBeCallableWith({ params: 1 });

    const mutationNoBody = createJsonMutation({
      params: declareParams<number>(),
      request: {
        url: '',
        method: 'POST' as const,
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutationNoBody.start).toBeCallableWith(1);
    // @ts-expect-error should be callable with number
    expectTypeOf(mutationNoBody.start).toBeCallableWith({ params: 1 });
  });

  test('infer data type from contract', () => {
    const contract: Contract<unknown, number> = {} as any;
    const mutation = createJsonMutation({
      request: { url: '', method: 'GET' },
      response: { contract },
    });

    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{
        result: number;
        params: void;
        meta: ExecutionMeta;
      }>
    >();

    // @ts-expect-error invalid result
    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{
        result: string;
        params: void;
        meta: ExecutionMeta;
      }>
    >();
  });

  test('allow expected status as number', () => {
    const mutation1 = createJsonMutation({
      request: { url: '', method: 'GET' },
      response: { contract: unknownContract, status: { expected: 200 } },
    });
  });

  test('allow expected status as array of numbers', () => {
    const mutation2 = createJsonMutation({
      request: { url: '', method: 'GET' },
      response: { contract: unknownContract, status: { expected: [201, 204] } },
    });
  });

  test('allow valdidation as fn in no params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutation1 = createJsonMutation({
      request: { url: '', method: 'GET' },
      response: {
        contract,
        validate: ({ result, params }) => {
          expectTypeOf(result).toBeNumber();
          // @ts-expect-error invalid type
          expectTypeOf(result).toBeString();

          expectTypeOf(params).toBeVoid();
          // @ts-expect-error invalid type
          expectTypeOf(params).toBeNumber();

          return true;
        },
      },
    });
  });

  test('allow valdidation as fn with source in no params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutation2 = createJsonMutation({
      request: { url: '', method: 'GET' },
      response: {
        contract,
        validate: {
          source: createStore<boolean>(false),
          fn: ({ result, params }, source) => {
            expectTypeOf(result).toBeNumber();
            // @ts-expect-error invalid type
            expectTypeOf(result).toBeString();

            expectTypeOf(params).toBeVoid();
            // @ts-expect-error invalid type
            expectTypeOf(params).toBeNumber();

            expectTypeOf(source).toBeBoolean();
            // @ts-expect-error invalid type
            expectTypeOf(source).toBeNumber();

            return true;
          },
        },
      },
    });
  });

  test('allow valdidation as fn in params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutation1 = createJsonMutation({
      params: declareParams<string>(),
      request: { url: '', method: 'GET' },
      response: {
        contract,
        validate: ({ result, params }) => {
          expectTypeOf(result).toBeNumber();
          // @ts-expect-error invalid type
          expectTypeOf(result).toBeString();

          expectTypeOf(params).toBeString();
          // @ts-expect-error invalid type
          expectTypeOf(params).toBeNumber();

          return true;
        },
      },
    });
  });

  test('allow valdidation as fn with source in params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutation2 = createJsonMutation({
      params: declareParams<string>(),
      request: { url: '', method: 'GET' },
      response: {
        contract,
        validate: {
          source: createStore<boolean>(false),
          fn: ({ result, params }, soruce) => {
            expectTypeOf(result).toBeNumber();
            // @ts-expect-error invalid type
            expectTypeOf(result).toBeNull();

            expectTypeOf(params).toBeString();
            // @ts-expect-error invalid type
            expectTypeOf(params).toBeNumber();

            expectTypeOf(soruce).toBeBoolean();
            // @ts-expect-error invalid type
            expectTypeOf(soruce).toBeNumber();

            return true;
          },
        },
      },
    });
  });

  test('mapParams as fn in params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutationOne = createJsonMutation({
      params: declareParams<string>(),
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: {
        contract,
        mapData: ({ result, params }) => {
          expectTypeOf(result).toBeNumber();
          // @ts-expect-error invalid type
          expectTypeOf(result).toBeString();

          expectTypeOf(params).toBeString();
          // @ts-expect-error invalid type
          expectTypeOf(params).toBeNumber();

          return false;
        },
      },
    });

    expectTypeOf(mutationOne.finished.success).toEqualTypeOf<
      Event<{ result: boolean; params: string; meta: ExecutionMeta }>
    >();

    // @ts-expect-error invalid result
    expectTypeOf(mutationOne.finished.success).toEqualTypeOf<
      Event<{ result: number; params: string; meta: ExecutionMeta }>
    >();
  });

  test('mapParams as fn with source in params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutationTwo = createJsonMutation({
      params: declareParams<string>(),
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: {
        contract,
        mapData: {
          source: createStore(false),
          fn: ({ result, params }, soruce) => {
            expectTypeOf(result).toBeNumber();
            // @ts-expect-error invalid type
            expectTypeOf(result).toBeString();

            expectTypeOf(params).toBeString();
            // @ts-expect-error invalid type
            expectTypeOf(params).toBeNumber();

            expectTypeOf(soruce).toBeBoolean();
            // @ts-expect-error invalid type
            expectTypeOf(soruce).toBeNumber();

            return false;
          },
        },
      },
    });

    expectTypeOf(mutationTwo.finished.success).toEqualTypeOf<
      Event<{ result: boolean; params: string; meta: ExecutionMeta }>
    >();
    // @ts-expect-error invalid result
    expectTypeOf(mutationTwo.finished.success).toEqualTypeOf<
      Event<{ result: number; params: string; meta: ExecutionMeta }>
    >();
  });

  test('mapParams as fn in no params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutationOne = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: {
        contract,
        mapData: ({ result, params }) => {
          expectTypeOf(result).toBeNumber();
          // @ts-expect-error invalid type
          expectTypeOf(result).toBeString();

          expectTypeOf(params).toBeVoid();
          // @ts-expect-error invalid type
          expectTypeOf(params).toBeNumber();

          return false;
        },
      },
    });

    expectTypeOf(mutationOne.finished.success).toEqualTypeOf<
      Event<{ result: boolean; params: void; meta: ExecutionMeta }>
    >();

    // @ts-expect-error invalid result
    expectTypeOf(mutationOne.finished.success).toEqualTypeOf<
      Event<{ result: number; params: void; meta: ExecutionMeta }>
    >();
  });

  test('mapParams as fn with source in no params case', () => {
    const contract: Contract<unknown, number> = {} as any;

    const mutationTwo = createJsonMutation({
      request: {
        url: '',
        method: 'GET' as const,
      },
      response: {
        contract,
        mapData: {
          source: createStore(false),
          fn: ({ result, params }, soruce) => {
            expectTypeOf(result).toBeNumber();
            // @ts-expect-error invalid type
            expectTypeOf(result).toBeString();

            expectTypeOf(params).toBeVoid();
            // @ts-expect-error invalid type
            expectTypeOf(params).toBeNumber();

            expectTypeOf(soruce).toBeBoolean();
            // @ts-expect-error invalid type
            expectTypeOf(soruce).toBeNumber();

            return false;
          },
        },
      },
    });

    expectTypeOf(mutationTwo.finished.success).toEqualTypeOf<
      Event<{ result: boolean; params: void; meta: ExecutionMeta }>
    >();
    // @ts-expect-error invalid result
    expectTypeOf(mutationTwo.finished.success).toEqualTypeOf<
      Event<{ result: number; params: void; meta: ExecutionMeta }>
    >();
  });

  test('allow to pass credentials', () => {
    const mutation = createJsonMutation({
      request: {
        url: 'https://salo.com',
        method: 'GET',
        credentials: 'same-origin',
      },
      response: { contract: unknownContract },
    });

    expectTypeOf(mutation).toEqualTypeOf<
      Mutation<void, unknown, DefaultRequestError>
    >();
  });
});
