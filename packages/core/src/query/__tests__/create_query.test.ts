import { allSettled, createEffect, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createQuery } from '../create_query';
import { onAbort } from '../../remote_operation/on_abort';
import { createDefer } from '../../libs/lohyphen';
import { setTimeout } from 'timers/promises';

describe('core/createQuery/handler', () => {
  test('uses resolved Promise as data source', async () => {
    const query = createQuery({ handler: async (p: number) => p + 15 });

    const scope = fork();

    await allSettled(query.start, { scope, params: 42 });
    expect(scope.getState(query.$data)).toBe(42 + 15);
    expect(scope.getState(query.$error)).toBeNull();

    await allSettled(query.start, { scope, params: 13 });
    expect(scope.getState(query.$data)).toBe(13 + 15);
    expect(scope.getState(query.$error)).toBeNull();
  });

  test('uses rejected Promise as error source', async () => {
    const query = createQuery({
      handler: async (m: string): Promise<number> => {
        throw new Error(m);
      },
    });

    const scope = fork();

    await allSettled(query.start, { scope, params: 'First' });
    expect(scope.getState(query.$error)).toEqual(new Error('First'));
    expect(scope.getState(query.$data)).toBeNull();

    await allSettled(query.start, { scope, params: 'Second' });
    expect(scope.getState(query.$error)).toEqual(new Error('Second'));
    expect(scope.getState(query.$data)).toBeNull();
  });
});

describe('core/createQuery/effect', () => {
  test('uses success Effect as data source', async () => {
    const query = createQuery({
      effect: createEffect((p: number) => p + 15),
    });

    const scope = fork();

    await allSettled(query.start, { scope, params: 42 });
    expect(scope.getState(query.$data)).toBe(42 + 15);
    expect(scope.getState(query.$error)).toBeNull();

    await allSettled(query.start, { scope, params: 13 });
    expect(scope.getState(query.$data)).toBe(13 + 15);
    expect(scope.getState(query.$error)).toBeNull();
  });

  test('uses failed Effect as error source', async () => {
    const query = createQuery({
      effect: createEffect((m: string) => {
        throw new Error(m);
      }),
    });

    const scope = fork();

    await allSettled(query.start, { scope, params: 'First' });
    expect(scope.getState(query.$error)).toEqual(new Error('First'));
    expect(scope.getState(query.$data)).toBeNull();

    await allSettled(query.start, { scope, params: 'Second' });
    expect(scope.getState(query.$error)).toEqual(new Error('Second'));
    expect(scope.getState(query.$data)).toBeNull();
  });

  // Case for non-TS users who forget to provide handler/effect
  test('core/createQuery/no-handler-or-effect', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => createQuery({} as any)).toThrowErrorMatchingInlineSnapshot(
      `"handler or effect must be passed to the config"`
    );
  });

  test('uses value from initialData as initial value of $data', async () => {
    const query = createQuery({
      initialData: 17,
      handler: async () => 42,
    });

    const scope = fork();

    expect(scope.getState(query.$data)).toBe(17);
  });

  test('uses value from initialData after reset as $data', async () => {
    const query = createQuery({
      initialData: 17,
      handler: async (_: void) => 42,
    });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toBe(42);

    await allSettled(query.reset, { scope });
    expect(scope.getState(query.$data)).toBe(17);
  });

  test('uses value from initialData after error as $data', async () => {
    const query = createQuery({
      initialData: 17,
      handler: vi
        .fn()
        .mockResolvedValueOnce(42)
        .mockRejectedValueOnce(new Error()),
    });

    const scope = fork();

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toBe(42);

    await allSettled(query.start, { scope });
    expect(scope.getState(query.$data)).toBe(17);
  });
});

describe('createQuery/onAbort', () => {
  test('no waiting and plain function', async () => {
    const q = createQuery({
      handler: async (_: void) => {
        const defer = createDefer();

        onAbort(() => defer.reject());

        await setTimeout(10);
        defer.resolve(null);

        return defer.promise;
      },
    });

    const scope = fork();

    createWatch({
      unit: q.__.lowLevelAPI.callObjectCreated,
      scope,
      fn: ({ abort }) => abort(),
    });

    const abortListener = vi.fn();

    createWatch({
      unit: q.aborted,
      scope,
      fn: abortListener,
    });

    await allSettled(q.start, { scope });

    expect(scope.getState(q.$status)).toBe('initial');
    expect(abortListener).toHaveBeenCalledTimes(1);
  });
});
