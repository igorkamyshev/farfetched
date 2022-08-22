import { watchQuery } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';

import { unkownContract } from '../../contract/unkown_contract';
import { identity } from '../../misc/identity';
import { withFactory } from '../../misc/sid';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('remote_data/connect_query', () => {
  const languagesQ = withFactory({
    sid: '1',
    fn: () =>
      createHeadlessQuery({
        contract: unkownContract,
        mapData(data) {
          return data as string;
        },
      }),
  });

  const blocksQ = withFactory({
    sid: '2',
    fn: () =>
      createHeadlessQuery({
        contract: unkownContract,
        mapData(data) {
          return data as Array<string>;
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
        contract: unkownContract,
        mapData: identity,
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
        contract: unkownContract,
        mapData: identity,
      }),
  });

  connectQuery({
    source: { language: languagesQ, blocks: blocksQ },
    fn({ language, blocks }) {
      return { params: { language, ids: blocks } };
    },
    target: [firstContentQ, secondContentQ],
  });

  test('execute child with daat from parents', async () => {
    const childResposne = Symbol('response');
    const fetchContentMock = jest.fn(() => childResposne);

    const scope = fork({
      handlers: [
        [blocksQ.__.executeFx, jest.fn(() => ['one', 'two'])],
        [languagesQ.__.executeFx, jest.fn(() => 'RU')],
        [firstContentQ.__.executeFx, fetchContentMock],
        [secondContentQ.__.executeFx, fetchContentMock],
      ],
    });

    const firstWatcher = watchQuery(firstContentQ, scope);
    const secondWatcher = watchQuery(firstContentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope, params: {} }),
      allSettled(blocksQ.start, { scope, params: {} }),
    ]);

    expect(firstWatcher.listeners.onDone).toBeCalledTimes(1);
    expect(firstWatcher.listeners.onDone).toBeCalledWith({
      data: childResposne,
    });

    expect(secondWatcher.listeners.onDone).toBeCalledTimes(1);
    expect(secondWatcher.listeners.onDone).toBeCalledWith({
      data: childResposne,
    });

    expect(fetchContentMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'RU', ids: ['one', 'two'] })
    );
  });
});
