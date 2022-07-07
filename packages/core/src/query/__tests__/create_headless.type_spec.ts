import { expectType } from 'tsd';

import { createHeadlessQuery } from '../create_headless_query';
import { Query } from '../type';

const numberQuery = createHeadlessQuery({
  contract: {
    data: { validate: () => null, extract: () => 1 },
    error: { is: () => false, extract: () => 1 },
  },
});

expectType<Query<unknown, number, unknown | number>>(numberQuery);

const stringQuery = createHeadlessQuery({
  contract: {
    data: { validate: () => null, extract: () => 'some string' },
    error: { is: () => false, extract: () => 1 },
  },
});

expectType<Query<unknown, string, unknown | number>>(stringQuery);
