import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { watchRemoteOperation } from '../../test_utils/watch_query';
import { unknownContract } from '../../contract/unknown_contract';
import { withFactory } from '../../libs/patronus';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('connectQuery re-execution of sources', () => {
  const languagesQ = withFactory({
    sid: '1',
    fn: () =>
      createHeadlessQuery({
        contract: unknownContract,
        mapData({ result }) {
          return result as string;
        },
      }),
  });

  const blocksQ = withFactory({
    sid: '2',
    fn: () =>
      createHeadlessQuery({
        contract: unknownContract,
        mapData({ result }) {
          return result as Array<string>;
        },
      }),
  });

  const contentQ = withFactory({
    sid: '3',
    fn: () =>
      createHeadlessQuery<
        { language: string; ids: string[] },
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
    fn({ language, blocks }) {
      return { params: { language: language.result, ids: blocks.result } };
    },
    target: contentQ,
  });

  test('execute child after all parents done', async () => {
    const childListener = vi
      .fn()
      .mockResolvedValueOnce('content_1')
      .mockResolvedValueOnce('content_2');
    const scope = fork({
      handlers: [
        [
          languagesQ.__.executeFx,
          vi
            .fn()
            .mockResolvedValueOnce('language_1')
            .mockResolvedValueOnce('language_2'),
        ],
        [
          blocksQ.__.executeFx,
          vi
            .fn()
            .mockReturnValueOnce('block_1')
            .mockResolvedValueOnce('block_2'),
        ],
        [contentQ.__.executeFx, childListener],
      ],
    });

    const childWatcher = watchRemoteOperation(contentQ, scope);

    // First execution
    await Promise.all([
      allSettled(languagesQ.start, { scope, params: 1 }),
      allSettled(blocksQ.start, { scope, params: 1 }),
    ]);

    expect(childWatcher.listeners.onSuccess).toHaveBeenCalledTimes(1);
    expect(childWatcher.listeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'content_1',
        params: { ids: 'block_1', language: 'language_1' },
      })
    );

    // Re-execution
    await Promise.all([allSettled(languagesQ.start, { scope, params: 2 })]);

    expect(childWatcher.listeners.onSuccess).toHaveBeenCalledTimes(2);
    expect(childWatcher.listeners.onSuccess).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        result: 'content_2',
        params: { ids: 'block_1', language: 'language_2' },
      })
    );
  });
});
