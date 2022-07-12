import { createStore } from 'effector';
import { expectNotAssignable, expectType } from 'tsd';

import { createJsonApiRequest, Json } from '../json';

// Does not matter
const request = {
  method: 'POST' as const,
  url: 'https://api.salo.com',
  credentials: 'same-origin' as const,
};

disallow_date_in_json: {
  const callJsonApiFx = createJsonApiRequest({ request });

  expectNotAssignable<Parameters<typeof callJsonApiFx>[0]>({
    body: { date: new Date() },
  });

  expectType<Parameters<typeof callJsonApiFx>[0]>({
    body: { date: new Date().toISOString() },
  });
}

disallow_date_in_json_store: {
  expectNotAssignable<{ date: Date }>(createStore<Json>({}));
}
