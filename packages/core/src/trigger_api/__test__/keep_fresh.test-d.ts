import { describe, test } from 'vitest';

import { Query } from '../../query/type';
import { keepFresh } from '../keep_fresh';

describe('keepFresh', () => {
  test('supports Query with initialData', () => {
    const q = {} as unknown as Query<number, string, string, string>;

    keepFresh(q, { automatically: true });
    keepFresh(q, { triggers: [] });
    keepFresh(q, { automatically: true, triggers: [] });
  });
});
