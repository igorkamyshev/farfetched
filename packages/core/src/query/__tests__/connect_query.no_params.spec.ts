import { watchQuery } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';

import { unkownContract } from '../../contract/unkown_contract';
import { identity } from '../../misc/identity';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('remote_data/connect_query', () => {
  const languagesQ = createHeadlessQuery<
    void,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
  >(
    {
      contract: unkownContract,
      mapData: identity,
    },
    { sid: '1' }
  );

  const blocksQ = createHeadlessQuery<
    void,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
  >(
    {
      contract: unkownContract,
      mapData: identity,
    },
    { sid: '2' }
  );

  const contentQ = createHeadlessQuery<
    void,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
  >(
    {
      contract: unkownContract,
      mapData: identity,
    },
    { sid: '3' }
  );

  connectQuery({
    source: { language: languagesQ, blocks: blocksQ },
    target: contentQ,
  });

  test('execute child after all parents done', async () => {
    const response = Symbol('response');

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, jest.fn(() => response)],
        [contentQ.__.executeFx, jest.fn(() => response)],
        [blocksQ.__.executeFx, jest.fn(() => response)],
      ],
    });

    const childWatcher = watchQuery(contentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope }),
      allSettled(blocksQ.start, { scope }),
    ]);

    expect(childWatcher.listeners.onDone).toHaveBeenCalledTimes(1);
  });

  test('does not execute child after one parent', async () => {
    const response = Symbol('response');

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, jest.fn(() => response)],
        [contentQ.__.executeFx, jest.fn(() => response)],
        [blocksQ.__.executeFx, jest.fn(() => response)],
      ],
    });

    const childWatcher = watchQuery(contentQ, scope);

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
          jest.fn(() => {
            throw error;
          }),
        ],
        [contentQ.__.executeFx, jest.fn(() => response)],
        [blocksQ.__.executeFx, jest.fn(() => response)],
      ],
    });

    const childWatcher = watchQuery(contentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope }),
      allSettled(blocksQ.start, { scope }),
    ]);

    expect(childWatcher.listeners.onStart).not.toHaveBeenCalled();
  });
});
