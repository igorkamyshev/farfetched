import { createStore } from 'effector';
import { expectType } from 'tsd';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../remote_operation/params';
import { Contract } from '../../contract/type';

no_params: {
  const numberContract: Contract<unknown, number> = {} as any;

  // callback
  createJsonQuery({
    request: {
      method: 'GET' as const,
      url: 'http://api.salo.com',
    },
    response: {
      contract: numberContract,
      validate: ({ result, params }) => {
        expectType<number>(result);
        expectType<void>(params);
        return true;
      },
    },
  });

  // callback with source
  createJsonQuery({
    request: {
      method: 'GET' as const,
      url: 'http://api.salo.com',
    },
    response: {
      contract: numberContract,
      validate: {
        source: createStore(false),
        fn: ({ result, params }, s) => {
          expectType<number>(result);
          expectType<void>(params);
          expectType<boolean>(s);
          return true;
        },
      },
    },
  });
}

params: {
  const numberContract: Contract<unknown, number> = {} as any;

  // callback
  createJsonQuery({
    params: declareParams<string>(),
    request: {
      method: 'GET' as const,
      url: 'http://api.salo.com',
    },
    response: {
      contract: numberContract,
      validate: ({ result, params }) => {
        expectType<number>(result);
        expectType<string>(params);
        return true;
      },
    },
  });

  // callback with source
  createJsonQuery({
    params: declareParams<string>(),
    request: {
      method: 'GET' as const,
      url: 'http://api.salo.com',
    },
    response: {
      contract: numberContract,
      validate: {
        source: createStore(false),
        fn: ({ result, params }, s) => {
          expectType<number>(result);
          expectType<string>(params);
          expectType<boolean>(s);
          return true;
        },
      },
    },
  });
}
