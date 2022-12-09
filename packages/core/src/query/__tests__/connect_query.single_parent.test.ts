import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { withFactory } from '../../libs/patronus';
import { connectQuery } from '../connect_query';
import { createHeadlessQuery } from '../create_headless_query';

describe('connectQuery with single parent', () => {
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
        unknown
      >({
        contract: unknownContract,
        mapData: ({ result }) => result,
      }),
  });

  connectQuery({
    source: languagesQ,
    fn(language) {
      return { params: { language: language.result } };
    },
    target: contentQ,
  });

  test('execute child with data from parents', async () => {
    const childResposne = Symbol('response');
    const fetchContentMock = vi.fn(() => childResposne);

    const scope = fork({
      handlers: [
        [languagesQ.__.executeFx, vi.fn(() => 'RU')],
        [contentQ.__.executeFx, fetchContentMock],
      ],
    });

    const childWatcher = watchRemoteOperation(contentQ, scope);

    await allSettled(languagesQ.start, { scope, params: {} });

    expect(childWatcher.listeners.onSuccess).toBeCalledTimes(1);
    expect(childWatcher.listeners.onSuccess).toBeCalledWith(
      expect.objectContaining({
        params: {
          language: 'RU',
        },
        result: childResposne,
      })
    );
    expect(fetchContentMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'RU' })
    );
  });
});
