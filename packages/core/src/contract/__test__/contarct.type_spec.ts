import { expectType } from 'tsd';

import { Contract } from '../type';

const contract: Contract<unknown, string> = {} as any;

const value = {};

if (contract.isData(value)) {
  expectType<string>(value);
}
