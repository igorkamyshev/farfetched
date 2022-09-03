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

  const contentQ = withFactory({
    sid: '2',
    fn: () =>
      createHeadlessQuery<
        { language: string },
        unknown,
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
    source: languagesQ,
    fn(language) {
      return { params: { language } };
    },
    target: contentQ,
  });

  test('execute child with data from parents', async () => {
    const childResposne = Symbol('response');
    const fetchContentMock = jest.fn(() => childResposne);

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, jest.fn(() => 'RU')],
        [contentQ.__.executeFx, fetchContentMock],
      ],
    });

    const childWatcher = watchQuery(contentQ, scope);

    await allSettled(languagesQ.start, { scope, params: {} });

    expect(childWatcher.listeners.onSuccess).toBeCalledTimes(1);
    expect(childWatcher.listeners.onSuccess).toBeCalledWith({
      params: {
        language: 'RU',
      },
      data: childResposne,
    });
    expect(fetchContentMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'RU' })
    );
  });
});
