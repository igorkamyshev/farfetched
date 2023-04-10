import { createJsonQuery, declareParams, sourced } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { createStore } from 'effector';
import { Array } from 'runtypes';

import { Quote } from './contract';

export const randomQuotesQuery = createJsonQuery({
  params: declareParams<{ amount: number }>(),
  initialData: [],
  request: {
    method: 'GET',
    url: sourced({
      source: createStore(2),
      fn: ({ amount }, source) =>
        `https://api.breakingbadquotes.xyz/v1/quotes/${amount}`,
    }),
  },
  response: {
    contract: runtypeContract(Array(Quote)),
  },
});
