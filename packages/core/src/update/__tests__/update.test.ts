import { allPrevSettled, watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { createMutation } from '../../mutation/create_mutation';
import { createQuery } from '../../query/create_query';
import { update } from '../update';

describe('update', () => {
  test('change query state with a result after mutation success anf failure', async () => {
    const query = createQuery({
      handler: vi.fn().mockRejectedValue(new Error('Cannot')),
    });
    const mutation = createMutation({
      handler: vi
        .fn()
        .mockResolvedValueOnce('from mutation')
        .mockRejectedValueOnce(new Error('Cannot')),
    });

    update(query, {
      on: mutation,
      by: {
        success: () => ({ result: 'bySuccess' }),
        failure: () => ({ result: 'byFailure' }),
      },
    });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    await allSettled(query.start, { scope });

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$data)).toEqual('bySuccess');
    expect(scope.getState(query.$error)).toEqual(null);

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$data)).toEqual('byFailure');
    expect(scope.getState(query.$error)).toEqual(null);

    expect(listeners.onStart).toBeCalledTimes(1); // only original call
  });

  test('change query state with a result after mutation success anf failure', async () => {
    const query = createQuery({
      handler: vi.fn().mockResolvedValue('from query'),
    });
    const mutation = createMutation({
      handler: vi
        .fn()
        .mockResolvedValueOnce('from mutation')
        .mockRejectedValueOnce(new Error('Cannot')),
    });

    update(query, {
      on: mutation,
      by: {
        success: () => ({ error: 'bySuccess' }),
        failure: () => ({ error: 'byFailure' }),
      },
    });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    await allSettled(query.start, { scope });

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('bySuccess');
    expect(scope.getState(query.$data)).toEqual(null);

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('byFailure');
    expect(scope.getState(query.$data)).toEqual(null);

    expect(listeners.onStart).toBeCalledTimes(1); // only original call
  });

  test('respect initialData of query', async () => {
    const query = createQuery({
      handler: vi.fn().mockRejectedValue(new Error('Cannot')),
      initialData: 'initial',
    });
    const mutation = createMutation({
      handler: vi
        .fn()
        .mockResolvedValueOnce('from mutation')
        .mockRejectedValueOnce(new Error('Cannot')),
    });

    update(query, {
      on: mutation,
      by: {
        success: () => ({ error: 'bySuccess' }),
        failure: () => ({ error: 'byFailure' }),
      },
    });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    await allSettled(query.start, { scope });

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('bySuccess');
    expect(scope.getState(query.$data)).toEqual('initial');

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('byFailure');
    expect(scope.getState(query.$data)).toEqual('initial');

    expect(listeners.onStart).toBeCalledTimes(1); // only original call
  });

  test('refetch true causes query to be refetched with latest params', async () => {
    const query = createQuery({
      handler: vi
        .fn()
        .mockImplementation((params: number) =>
          setTimeout(100).then(() => params.toString())
        ),
      initialData: 'initial',
    });
    const mutation = createMutation({
      handler: vi.fn().mockResolvedValue('from mutation'),
    });

    update(query, {
      on: mutation,
      by: {
        success: () => ({ result: 'bySuccess', refetch: true }),
      },
    });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    await allSettled(query.start, { scope, params: 1 });
    await allSettled(query.start, { scope, params: 2 });

    allSettled(mutation.start, { scope }); // Do not wait
    await setTimeout(1); // Async nature of mutations
    expect(scope.getState(query.$data)).toEqual('bySuccess');
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allPrevSettled(scope);
    expect(scope.getState(query.$data)).toEqual('2');

    expect(listeners.onStart).toBeCalledTimes(3); // 2 original and 1 by refetch
    expect(listeners.onStart).toHaveBeenNthCalledWith(3, 2); // refetch uses latest params
    expect(scope.getState(query.$stale)).toBeFalsy();
  });

  test('refetch with params causes query to be refetched with new params', async () => {
    const query = createQuery({
      handler: vi
        .fn()
        .mockImplementation((params: number) =>
          setTimeout(100).then(() => params.toString())
        ),
      initialData: 'initial',
    });
    const mutation = createMutation({
      handler: vi.fn().mockResolvedValue('from mutation'),
    });

    update(query, {
      on: mutation,
      by: {
        success: () => ({ result: 'bySuccess', refetch: { params: 3 } }),
      },
    });

    const scope = fork();

    const { listeners } = watchRemoteOperation(query, scope);

    await allSettled(query.start, { scope, params: 1 });
    await allSettled(query.start, { scope, params: 2 });

    allSettled(mutation.start, { scope }); // Do not wait
    await setTimeout(1); // Async nature of mutations
    expect(scope.getState(query.$data)).toEqual('bySuccess');
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allPrevSettled(scope);
    expect(scope.getState(query.$data)).toEqual('3');

    expect(listeners.onStart).toBeCalledTimes(3); // 2 original and 1 by refetch
    expect(listeners.onStart).toHaveBeenNthCalledWith(3, 3); // refetch uses params from callback
    expect(scope.getState(query.$stale)).toBeFalsy();
  });
});
