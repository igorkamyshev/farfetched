import { allSettled, createEffect, fork } from 'effector';
import { describe, test, expect } from 'vitest';

import { createQuery } from '../create_query';

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
});

// Case for non-TS users who forget to provide handler/effect
test('core/createQuery/no-handler-or-effect', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(() => createQuery({} as any)).toThrowErrorMatchingInlineSnapshot(
    `"handler or effect must be passed to the config"`
  );
});
