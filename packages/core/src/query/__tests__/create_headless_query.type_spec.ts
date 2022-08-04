import { createStore } from 'effector';
import { expectType } from 'tsd';
import { Contract } from '../../contract/type';
import { unkownContract } from '../../contract/unkown_contract';

import { createHeadlessQuery } from '../create_headless_query';
import { Query } from '../type';

contract: {
  const numberContract = {} as Contract<unknown, number, number>;

  const numberQuery = createHeadlessQuery({
    contract: numberContract,
    mapData: (v) => v,
  });

  expectType<Query<unknown, number, unknown | number>>(numberQuery);

  const stringContract = {} as Contract<unknown, string, number>;

  const stringQuery = createHeadlessQuery({
    contract: stringContract,
    mapData: (v) => v,
  });

  expectType<Query<unknown, string, unknown | number>>(stringQuery);
}

mapData_callback: {
  const numberQuery = createHeadlessQuery({
    contract: unkownContract,
    mapData: (data, params) => 12,
  });

  expectType<Query<unknown, number, unknown>>(numberQuery);

  const objectQuery = createHeadlessQuery({
    contract: unkownContract,
    mapData: (data, params) => ({ response: 12 }),
  });

  expectType<Query<unknown, { response: number }, unknown>>(objectQuery);
}

mapData_callback_source: {
  const numberQuery = createHeadlessQuery({
    contract: unkownContract,
    mapData: {
      source: createStore(0),
      fn: (data, params, source) => {
        expectType<number>(source);
        return 12;
      },
    },
  });

  expectType<Query<unknown, number, unknown>>(numberQuery);

  const objectQuery = createHeadlessQuery({
    contract: unkownContract,
    mapData: {
      source: createStore({ response: 12 }),
      fn: (data, params, source) => {
        expectType<{ response: number }>(source);
        return source;
      },
    },
  });

  expectType<Query<unknown, { response: number }, unknown>>(objectQuery);
}
