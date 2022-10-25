import { createStore } from 'effector';
import { expectType } from 'tsd';

import { createJsonQuery } from '../create_json_query';
import { declareParams } from '../../misc/params';
import { unknownContract } from '../../contract/unknown_contract';

no_params: {
  // callback
  createJsonQuery({
    response: { contract: unknownContract },
    request: {
      method: 'GET' as const,
      url: (p) => {
        expectType<void>(p);
        return 'http://api.salo.com';
      },
    },
  });

  // Store
  createJsonQuery({
    response: { contract: unknownContract },
    request: {
      method: 'GET' as const,
      url: createStore('http://api.salo.com'),
    },
  });

  // Store and callback
  createJsonQuery({
    response: { contract: unknownContract },
    request: {
      method: 'GET' as const,
      url: {
        source: createStore('http://api.salo.com'),
        fn(params, source) {
          expectType<void>(params);
          expectType<string>(source);
          return source;
        },
      },
    },
  });
}

params_no_mapData: {
  // Callback
  createJsonQuery({
    params: declareParams<string>(),
    response: { contract: unknownContract },
    request: {
      method: 'GET' as const,
      url: (params) => {
        expectType<string>(params);
        return 'http://api.salo.com';
      },
    },
  });

  // Store
  createJsonQuery({
    params: declareParams<string>(),
    response: { contract: unknownContract },
    request: {
      method: 'GET' as const,
      url: createStore('http://api.salo.com'),
    },
  });

  // Callback + store
  createJsonQuery({
    params: declareParams<string>(),
    response: { contract: unknownContract },
    request: {
      method: 'GET' as const,
      url: {
        source: createStore(12),
        fn: (params, source) => {
          expectType<string>(params);
          expectType<number>(source);
          return 'http://api.salo.com';
        },
      },
    },
  });
}

headers_combine: {
  const $headers = createStore({
    Authorization: `Bearer jwt`,
  });

  const query = createJsonQuery({
    request: {
      method: 'GET',
      url: 'https://api.salo.com',
      headers: $headers,
    },
    response: { contract: unknownContract },
  });
}
