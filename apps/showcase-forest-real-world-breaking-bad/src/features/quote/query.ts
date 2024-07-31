import { concurrency, createJsonQuery, declareParams } from '@farfetched/core';
import { arr } from '@withease/contracts';

import { Quote } from './contract';

export const randomQuotesQuery = createJsonQuery({
  params: declareParams<{ amount: number }>(),
  initialData: [],
  request: {
    method: 'GET',
    url: ({ amount }) =>
      `https://api.breakingbadquotes.xyz/v1/quotes/${amount}`,
  },
  response: {
    contract: arr(Quote),
  },
});

concurrency(randomQuotesQuery, { strategy: 'TAKE_LATEST' });
