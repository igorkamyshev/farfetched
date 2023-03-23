import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { cache } from '../cache/cache';
import { withFactory } from '../libs/patronus';
import { createMutation } from '../mutation/create_mutation';
import { createQuery } from '../query/create_query';
import { update } from '../update/update';

describe('invalidate cache on update', () => {
  test('do not use cached value for refetch query after update', async () => {
    const query = withFactory({
      fn: () =>
        createQuery({
          handler: vi
            .fn()
            .mockImplementationOnce(() =>
              setTimeout(100).then(() => 'old from remote source')
            )
            .mockImplementationOnce(() =>
              setTimeout(100).then(() => 'new from remote source')
            ),
        }),
      sid: 'q',
    });

    const mutation = createMutation({
      handler: vi.fn().mockResolvedValue('mutated data'),
    });

    cache(query);

    update(query, {
      on: mutation,
      by: {
        success: (state) => ({ result: state.mutation.result, refetch: true }),
      },
    });

    const scope = fork();

    await allSettled(query.start, { scope });

    allSettled(mutation.start, { scope });
    await setTimeout(1);
    expect(scope.getState(query.$data)).toEqual('mutated data');

    await allSettled(scope);
    expect(scope.getState(query.$data)).toEqual('new from remote source');
  });

  test('do not use cached value (with staleAfter) for refetch query after update', async () => {
    const query = withFactory({
      fn: () =>
        createQuery({
          handler: vi
            .fn()
            .mockImplementationOnce(() =>
              setTimeout(100).then(() => 'old from remote source')
            )
            .mockImplementationOnce(() =>
              setTimeout(100).then(() => 'new from remote source')
            ),
        }),
      sid: 'q',
    });

    const mutation = createMutation({
      handler: vi.fn().mockResolvedValue('mutated data'),
    });

    cache(query, { staleAfter: '10s' });

    update(query, {
      on: mutation,
      by: {
        success: (state) => ({ result: state.mutation.result, refetch: true }),
      },
    });

    const scope = fork();

    await allSettled(query.start, { scope });

    allSettled(mutation.start, { scope });
    await setTimeout(1);
    expect(scope.getState(query.$data)).toEqual('mutated data');

    await allSettled(scope);
    expect(scope.getState(query.$data)).toEqual('new from remote source');
  });

  test('do not use cached value for prev params after new params', async () => {
    const query = withFactory({
      fn: () =>
        createQuery({
          handler: vi
            .fn()
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `old result: ${p}`)
            )
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `new result: ${p}`)
            )
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `very new result: ${p}`)
            ),
        }),
      sid: 'q',
    });

    const mutation = createMutation({
      handler: vi.fn().mockResolvedValue('mutated data'),
    });

    cache(query);

    update(query, {
      on: mutation,
      by: {
        success: (state) => ({ result: state.mutation.result }),
      },
    });

    const scope = fork();

    await allSettled(query.start, { scope, params: 1 });
    expect(scope.getState(query.$data)).toEqual('old result: 1');

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$data)).toEqual('mutated data');

    await allSettled(query.start, { scope, params: 2 });
    expect(scope.getState(query.$data)).toEqual('new result: 2');

    allSettled(query.start, { scope, params: 1 });
    await setTimeout(1);
    expect(scope.getState(query.$data)).not.toEqual('old result: 1');

    await allSettled(scope);
    expect(scope.getState(query.$data)).toEqual('very new result: 1');
  });

  test('do use cached value for new params after update with old params', async () => {
    const query = withFactory({
      fn: () =>
        createQuery({
          handler: vi
            .fn()
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `old result: ${p}`)
            )
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `old result: ${p}`)
            )
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `new result: ${p}`)
            )
            .mockImplementationOnce((p: string) =>
              setTimeout(100).then(() => `very new result: ${p}`)
            ),
        }),
      sid: 'q',
    });

    const mutation = createMutation({
      handler: vi.fn().mockResolvedValue('mutated data'),
    });

    cache(query);

    update(query, {
      on: mutation,
      by: {
        success: (state) => ({ result: state.mutation.result }),
      },
    });

    const scope = fork();

    await allSettled(query.start, { scope, params: 2 });
    expect(scope.getState(query.$data)).toEqual('old result: 2');

    await allSettled(query.start, { scope, params: 1 });
    expect(scope.getState(query.$data)).toEqual('old result: 1');

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$data)).toEqual('mutated data');

    allSettled(query.start, { scope, params: 2 });
    await setTimeout(1);
    expect(scope.getState(query.$data)).toEqual('old result: 2');
  });
});
