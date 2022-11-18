import { expectType } from 'tsd';

import { Contract } from '../../contract/type';
import { declareParams } from '../../misc/params';
import { createJsonQuery } from '../create_json_query';
import { Query } from '../type';

params_mapData: {
  const query = createJsonQuery({
    params: declareParams<number>(),
    initialData: '14',
    request: { url: 'https://example.com', method: 'GET' },
    response: {
      mapData: ({ result }) => result.toString(),
      contract: {} as Contract<unknown, number>,
    },
  });

  expectType<Query<number, string, unknown, string>>(query);
}

params_no_mapDat: {
  const query = createJsonQuery({
    params: declareParams<number>(),
    initialData: '14',
    request: { url: 'https://example.com', method: 'GET' },
    response: {
      contract: {} as Contract<unknown, string>,
    },
  });

  expectType<Query<number, string, unknown, string>>(query);
}

no_params_mapData: {
  const query = createJsonQuery({
    initialData: '14',
    request: { url: 'https://example.com', method: 'GET' },
    response: {
      mapData: ({ result }) => result.toString(),
      contract: {} as Contract<unknown, number>,
    },
  });

  expectType<Query<void, string, unknown, string>>(query);
}

no_params_no_mapData: {
  const query = createJsonQuery({
    initialData: '14',
    request: { url: 'https://example.com', method: 'GET' },
    response: {
      contract: {} as Contract<unknown, string>,
    },
  });

  expectType<Query<void, string, unknown, string>>(query);
}
