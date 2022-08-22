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
        contract: unkownContract,
        mapData: identity,
      }),
  });

  connectQuery({
    source: { language: languagesQ, blocks: blocksQ },
    fn({ language, blocks }) {
      return { params: { language, ids: blocks } };
    },
    target: contentQ,
  });

  test('execute child with daat from parents', async () => {
    const childResposne = Symbol('response');
    const fetchContentMock = jest.fn(() => childResposne);

    const scope = fork({
      handlers: [
        [blocksQ.__.executeFx, jest.fn(() => ['one', 'two'])],
        [languagesQ.__.executeFx, jest.fn(() => 'RU')],
        [contentQ.__.executeFx, fetchContentMock],
      ],
    });

    const childWatcher = watchQuery(contentQ, scope);

    await Promise.all([
      allSettled(languagesQ.start, { scope, params: {} }),
      allSettled(blocksQ.start, { scope, params: {} }),
    ]);

    expect(childWatcher.listeners.onDone).toBeCalledTimes(1);
    expect(childWatcher.listeners.onDone).toBeCalledWith(childResposne);
    expect(fetchContentMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'RU', ids: ['one', 'two'] })
    );
  });
});
