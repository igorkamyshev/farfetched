import { expectType } from 'tsd';
import { Contract } from '@farfetched/core';
import { String, Number } from 'runtypes';

import { runtypeContract } from '../runtype_contract';

const contract = runtypeContract({ data: String, error: Number });

expectType<Contract<unknown, string, number>>(contract);
