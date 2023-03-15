import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createQuery } from '../query/create_query';
import { attachOperation } from '../attach/attach';
import { cache } from '../cache/cache';
import { withFactory } from '../libs/patronus';

describe('shared cache between base Query and attached one', async () => {
  test('attached query uses cache from base query', async () => {
    const baseHandler = vi.fn().mockResolvedValue('base result');

    const baseQuery = withFactory({
      fn: () => createQuery({ handler: baseHandler }),
      sid: '1',
    });
    cache(baseQuery, { staleAfter: '1s' });
    const attachedQuery = attachOperation(baseQuery);

    const scope = fork();

    await allSettled(attachedQuery.refresh, { scope });
    await allSettled(attachedQuery.refresh, { scope });

    expect(baseHandler).toBeCalledTimes(1);
  });
});
