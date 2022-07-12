import { createStore } from 'effector';
import { expectType } from 'tsd';

import { unkownContract } from '../../contract/unkown_contract';
import { declareParams } from '../../misc/params';
import { createJsonQuery } from '../create_json_query';

// callback
createJsonQuery({
  request: { url: 'http://api.salo.com', method: 'GET' as const },
  response: {
    contract: unkownContract,
    mapData: (data, params) => {
      expectType<unknown>(data);
      expectType<string>(params);
      return 12;
    },
  },
  params: declareParams<string>(),
});

// store + callback
createJsonQuery({
  request: { url: 'http://api.salo.com', method: 'GET' as const },
  response: {
    contract: unkownContract,
    mapData: {
      source: createStore(12),
      fn: (data, params, source) => {
        expectType<unknown>(data);
        expectType<string>(params);
        expectType<number>(source);
        return 12;
      },
    },
  },
  params: declareParams<string>(),
});
