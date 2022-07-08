import { expectType } from 'tsd';

import { Contract } from '../type';

const contract: Contract<unknown, string, number> = {} as any;

expectType<string>(contract.data.extract({}));
expectType<number>(contract.error.extract({}));
