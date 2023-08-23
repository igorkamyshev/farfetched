import { createEvent, type UnitValue } from 'effector';
import { describe, test } from 'vitest';

import { type Query } from '../../query/type';
import { retry } from '../retry';

describe('retry', () => {
  // Issue — https://github.com/igorkamyshev/farfetched/issues/326
  test('type of otherwise is compatible with query.finished.failure', () => {
    const query: Query<void, number, string> = {} as any;

    const otherwise = createEvent<UnitValue<typeof query.finished.failure>>();

    retry(query, { times: 1, delay: 0, otherwise });
  });
});
