import { watchQuery } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';

import { unkownContract } from '../../contract/unkown_contract';
import { identity } from '../../misc/identity';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('remote_data/connect_query', () => {
  const languagesQ = createHeadlessQuery(
    {
      contract: unkownContract,
      mapData(data) {
        return data as string;
      },
    },
    { sid: '1' }
  );

  const blocksQ = createHeadlessQuery(
    {
      contract: unkownContract,
      mapData(data) {
        return data as Array<string>;
      },
    },
    { sid: '2' }
  );

  const contentQ = createHeadlessQuery<
    { language: string; ids: string[] },
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
    fn({ language, blocks }) {
      return { language, ids: blocks };
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
