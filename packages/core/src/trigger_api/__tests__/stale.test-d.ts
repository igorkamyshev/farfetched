import { Event } from 'effector';
import { describe, test } from 'vitest';

import { Query } from '../../query/type';
import { stale } from '../stale';

describe('Trigger API, stale', () => {
  test('do not require params for Query<void, ...>', () => {
    const clock: Event<void> = {} as any;
    const query: Query<void, any, any> = {} as any;

    stale(query, { clock });

    // @ts-expect-error should not require params
    stale(query, { clock, params: () => 11 });
  });

  test('require params for Query<Smth, ...>', () => {
    const clock: Event<void> = {} as any;
    const query: Query<{ limit: number }, any, any> = {} as any;

    // @ts-expect-error should require params
    stale(query, { clock });

    stale(query, { clock, params: () => ({ limit: 10 }) });
  });
});
