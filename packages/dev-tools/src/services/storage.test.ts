import { createMutation, createQuery } from '@farfetched/core';
import { allSettled, fork } from 'effector';
import { describe, expect, test } from 'vitest';

import { $queries } from './storage';
import { appStarted } from './viewer';

describe('services/storage $queries', () => {
  test('put all queries to $queries', async () => {
    const oneQuery = createQuery({ handler: async (_: void) => null });
    const twoQuery = createQuery({ handler: async (_: void) => null });

    const scope = fork();

    await allSettled(appStarted, { scope });

    expect(scope.getState($queries)).toEqual([
      expect.objectContaining({ name: 'oneQuery', id: expect.any(String) }),
      expect.objectContaining({ name: 'twoQuery', id: expect.any(String) }),
    ]);
  });

  test('DO NOT put mutations to $queries', async () => {
    const oneQuery = createQuery({ handler: async (_: void) => null });
    const oneMutation = createMutation({ handler: async (_: void) => null });

    const scope = fork();

    await allSettled(appStarted, { scope });

    expect(scope.getState($queries)).toEqual([
      expect.objectContaining({ name: 'oneQuery', id: expect.any(String) }),
    ]);
  });
});
