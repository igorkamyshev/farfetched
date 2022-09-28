import { createStore } from 'effector';
import { expectType } from 'tsd';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../misc/params';
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
      validate: (a, b) => {
        expectType<number>(a);
        expectType<void>(b);
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
        fn: (a, b, s) => {
          expectType<number>(a);
          expectType<void>(b);
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
      validate: (a, b) => {
        expectType<number>(a);
        expectType<string>(b);
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
        fn: (a, b, s) => {
          expectType<number>(a);
          expectType<string>(b);
          expectType<boolean>(s);
          return true;
        },
      },
    },
  });
}
