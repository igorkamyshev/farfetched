import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { watchRemoteOperation } from '../../test_utils/watch_query';
import { unknownContract } from '../../contract/unknown_contract';
import { withFactory } from '../../libs/patronus';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('connectQuery and target without params', () => {
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

  test('execute child after all parents done', async () => {
    const response = Symbol('response');

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, vi.fn(() => response)],
        [contentQ.__.executeFx, vi.fn(() => response)],
        [blocksQ.__.executeFx, vi.fn(() => response)],
      ],
    });

    const childWatcher = watchRemoteOperation(contentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope }),
      allSettled(blocksQ.start, { scope }),
    ]);

    expect(childWatcher.listeners.onSuccess).toHaveBeenCalledTimes(1);
  });

  test('does not execute child after one parent', async () => {
    const response = Symbol('response');

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, vi.fn(() => response)],
        [contentQ.__.executeFx, vi.fn(() => response)],
        [blocksQ.__.executeFx, vi.fn(() => response)],
      ],
    });

    const childWatcher = watchRemoteOperation(contentQ, scope);

    await allSettled(languagesQ.start, { scope });

    expect(childWatcher.listeners.onStart).not.toHaveBeenCalled();
  });

  test('does not execute child after any parent fail', async () => {
    const response = Symbol('response');
    const error = Symbol('error');

    const scope = fork({
      handlers: [
        [
          languagesQ.__.executeFx,
          vi.fn(() => {
            throw error;
          }),
        ],
        [contentQ.__.executeFx, vi.fn(() => response)],
        [blocksQ.__.executeFx, vi.fn(() => response)],
      ],
    });

    const childWatcher = watchRemoteOperation(contentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope }),
      allSettled(blocksQ.start, { scope }),
    ]);

    expect(childWatcher.listeners.onStart).not.toHaveBeenCalled();
  });
});
