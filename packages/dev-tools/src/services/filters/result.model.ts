import { combine } from 'effector';

import { $queries } from '../storage';
import { $search } from './search.model';

export const $foundQueries = combine(
  { queries: $queries, search: $search },
  ({ queries, search }) =>
    search.length === 0
      ? queries
      : queries.filter((query) =>
          query.name.toLowerCase().includes(search.toLowerCase())
        )
);
