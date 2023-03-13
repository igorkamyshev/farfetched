import { createEffect, Effect } from 'effector';

import { invalidDataError } from '../errors/create_error';
import { type InvalidDataError } from '../errors/type';
import { type ExecutionMeta } from '../remote_operation/type';
import { type Contract } from './type';

export function createContractApplier<Params, Raw, Data extends Raw>(
  contract: Contract<Raw, Data>
): Effect<
  { params: Params; result: Raw; meta: ExecutionMeta },
  Data,
  InvalidDataError
> {
  const applyContractFx = createEffect<
    { params: Params; result: Raw; meta: ExecutionMeta },
    Data,
    InvalidDataError
  >({
    handler: ({ result: data }) => {
      const isData = contract.isData(data);
      if (!isData) {
        throw invalidDataError({
          validationErrors: contract.getErrorMessages(data),
          response: data,
        });
      }

      return data;
    },
    sid: 'ff.applyContractFx',
  });

  return applyContractFx;
}
