import { concurrency, createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array } from 'runtypes';

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
    contract: runtypeContract(Array(Quote)),
  },
});

concurrency(randomQuotesQuery, { strategy: 'TAKE_LATEST' });
