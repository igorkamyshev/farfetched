import { expectType } from 'tsd';
import { Contract } from '@farfetched/core';
import { z } from 'zod';

import { zodContract } from '../zod_contract';

const contract = zodContract(z.string());

expectType<Contract<unknown, string>>(contract);
