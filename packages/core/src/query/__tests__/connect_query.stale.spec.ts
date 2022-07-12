import { allSettled, fork } from 'effector';

import { unkownContract } from '../../contract/unkown_contract';
import { identity } from '../../misc/identity';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('remote_data/connect_query stale', () => {
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
