import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { allPrevSettled } from '@farfetched/test-utils';

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

    await allPrevSettled(scope);
    expect(scope.getState(query.$data)).toEqual('new from remote source');
  });
});
