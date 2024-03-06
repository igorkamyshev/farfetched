import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { watchRemoteOperation } from '../../test_utils/watch_query';
import { unknownContract } from '../../contract/unknown_contract';
import { withFactory } from '../../libs/patronus';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('connectQuery and target as an array', () => {
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

  const firstContentQ = withFactory({
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

  const secondContentQ = withFactory({
    sid: '4',
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
    target: [firstContentQ, secondContentQ],
  });

  test('execute child with daat from parents', async () => {
    const childResposne = Symbol('response');
    const fetchContentMock = vi.fn(() => childResposne);

    const scope = fork({
      handlers: [
        [blocksQ.__.executeFx, vi.fn(() => ['one', 'two'])],
        [languagesQ.__.executeFx, vi.fn(() => 'RU')],
        [firstContentQ.__.executeFx, fetchContentMock],
        [secondContentQ.__.executeFx, fetchContentMock],
      ],
    });

    const firstWatcher = watchRemoteOperation(firstContentQ, scope);
    const secondWatcher = watchRemoteOperation(firstContentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope, params: {} }),
      allSettled(blocksQ.start, { scope, params: {} }),
    ]);

    expect(firstWatcher.listeners.onSuccess).toBeCalledTimes(1);
    expect(firstWatcher.listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({
        params: {
          ids: ['one', 'two'],
          language: 'RU',
        },
        result: childResposne,
      })
    );

    expect(secondWatcher.listeners.onSuccess).toBeCalledTimes(1);
    expect(secondWatcher.listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({
        params: {
          ids: ['one', 'two'],
          language: 'RU',
        },
        result: childResposne,
      })
    );

    expect(fetchContentMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'RU', ids: ['one', 'two'] })
    );
  });
});
