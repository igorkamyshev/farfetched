import { expectType } from 'tsd';

import { Contract } from '../type';

const contract: Contract<unknown, string, number> = {} as any;

const value = {};

if (contract.isData(value)) {
  expectType<string>(value);
}

if (contract.isError(value)) {
  expectType<number>(value);
}
