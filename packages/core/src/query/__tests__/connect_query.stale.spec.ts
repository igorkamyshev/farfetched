import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { withFactory } from '../../libs/patronus';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('remote_data/connect_query stale', () => {
  const languagesQ = withFactory({
    sid: '1',
    fn: () =>
      createHeadlessQuery<
        void,
        unknown,
        unknown,
        unknown,
        unknown,
        unknown,
        unknown
      >({
        contract: unknownContract,
        mapData: ({ result }) => result,
      }),
  });

  const blocksQ = withFactory({
    sid: '2',
    fn: () =>
      createHeadlessQuery<
        void,
        unknown,
        unknown,
        unknown,
        unknown,
        unknown,
        unknown
      >({
        contract: unknownContract,
        mapData: ({ result }) => result,
      }),
  });

  const contentQ = withFactory({
    sid: '3',
    fn: () =>
      createHeadlessQuery<
        void,
        unknown,
        unknown,
        unknown,
        unknown,
        unknown,
        unknown
      >({
        contract: unknownContract,
        mapData: ({ result }) => result,
      }),
  });

  connectQuery({
    source: { language: languagesQ, blocks: blocksQ },
    target: contentQ,
  });

  test('mark child query as stale after any parent started', async () => {
    const response = Symbol('response');

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, vi.fn(() => response)],
        [contentQ.__.executeFx, vi.fn(() => response)],
        [blocksQ.__.executeFx, vi.fn(() => response)],
      ],
    });

    allSettled(languagesQ.start, { scope });
    expect(scope.getState(contentQ.$stale)).toBeTruthy();

    await allSettled(blocksQ.start, { scope });
    expect(scope.getState(contentQ.$stale)).toBeFalsy();
  });
});
