import { allSettled, fork } from 'effector';
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

    await allSettled(query.start, { scope });

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$data)).toEqual('bySuccess');
    expect(scope.getState(query.$error)).toEqual(null);

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$data)).toEqual('byFailure');
    expect(scope.getState(query.$error)).toEqual(null);
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

    await allSettled(query.start, { scope });

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('bySuccess');
    expect(scope.getState(query.$data)).toEqual(null);

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('byFailure');
    expect(scope.getState(query.$data)).toEqual(null);
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

    await allSettled(query.start, { scope });

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('bySuccess');
    expect(scope.getState(query.$data)).toEqual('initial');

    await allSettled(mutation.start, { scope });
    expect(scope.getState(query.$error)).toEqual('byFailure');
    expect(scope.getState(query.$data)).toEqual('initial');
  });
});
