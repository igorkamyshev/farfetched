import { expectType } from 'tsd';
import { Contract } from '@farfetched/core';
import { String } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

const contract = runtypeContract(String);

expectType<Contract<unknown, string, unknown>>(contract);
