import { Effect, Event } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { Contract } from '../../contract/type';
import { InvalidDataError } from '../../errors/type';
import { ExecutionMeta } from '../../remote_operation/type';
import { createMutation } from '../create_mutation';

describe('createMutation', () => {
  test('infer params and data from handler', () => {
    const mutation = createMutation({
      handler: async (params: number) => params.toString(),
    });

    expectTypeOf(mutation.start).toBeCallableWith(1);
    // @ts-expect-error invalid params type
    expectTypeOf(mutation.start).toBeCallableWith({});

    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{ params: number; result: string; meta: ExecutionMeta }>
    >();
    // @ts-expect-error invalid result type
    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{ params: string; result: string; meta: ExecutionMeta }>
    >();
  });

  test('inder params, data and error from effect', () => {
    const effect = {} as Effect<number, string, boolean>;

    const mutation = createMutation({
      effect,
    });

    expectTypeOf(mutation.start).toBeCallableWith(1);
    // @ts-expect-error invalid params type
    expectTypeOf(mutation.start).toBeCallableWith({});

    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{ params: number; result: string; meta: ExecutionMeta }>
    >();
    // @ts-expect-error invalid result type
    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{ params: string; result: string; meta: ExecutionMeta }>
    >();

    expectTypeOf(mutation.finished.failure).toEqualTypeOf<
      Event<{ params: number; error: boolean; meta: ExecutionMeta }>
    >();
    // @ts-expect-error invalid error type
    expectTypeOf(mutation.finished.failure).toEqualTypeOf<
      Event<{ params: string; error: boolean; meta: ExecutionMeta }>
    >();
  });

  test('contract override data type from effect', () => {
    const effect = {} as Effect<number, unknown, boolean>;
    const contract = {} as Contract<unknown, string>;

    const mutation = createMutation({ effect, contract });

    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{ params: number; result: string; meta: ExecutionMeta }>
    >();
    // @ts-expect-error invalid result type
    expectTypeOf(mutation.finished.success).toEqualTypeOf<
      Event<{ params: string; result: string; meta: ExecutionMeta }>
    >();

    expectTypeOf(mutation.finished.failure).toEqualTypeOf<
      Event<{
        params: number;
        error: boolean | InvalidDataError;
        meta: ExecutionMeta;
      }>
    >();
    // @ts-expect-error invalid error type
    expectTypeOf(mutation.finished.failure).toEqualTypeOf<
      Event<{ params: number; error: boolean; meta: ExecutionMeta }>
    >();
  });
});
