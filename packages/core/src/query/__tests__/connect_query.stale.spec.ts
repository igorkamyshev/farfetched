import { allSettled, fork } from 'effector';

import { unknownContract } from '../../contract/unknown_contract';
import { identity } from '../../misc/identity';
import { withFactory } from '../../misc/sid';
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
        unknown,
        unknown
      >({
        contract: unknownContract,
        mapData: identity,
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
        unknown,
        unknown
      >({
        contract: unknownContract,
        mapData: identity,
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
        unknown,
        unknown
      >({
        contract: unknownContract,
        mapData: identity,
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
        [languagesQ.__.executeFx, jest.fn(() => response)],
        [contentQ.__.executeFx, jest.fn(() => response)],
        [blocksQ.__.executeFx, jest.fn(() => response)],
      ],
    });

    allSettled(languagesQ.start, { scope });
    expect(scope.getState(contentQ.$stale)).toBeTruthy();

    await allSettled(blocksQ.start, { scope });
    expect(scope.getState(contentQ.$stale)).toBeFalsy();
  });
});
