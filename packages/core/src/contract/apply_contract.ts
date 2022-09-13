import { createEffect, Effect } from 'effector';

import { invalidDataError } from '../errors/create_error';
import { InvalidDataError } from '../errors/type';
import { Contract } from './type';

function createContractApplier<Params, Raw, Data extends Raw>(
  contract: Contract<Raw, Data>
): Effect<{ params: Params; result: Raw }, Data, InvalidDataError> {
  const applyContractFx = createEffect<
    { params: Params; result: Raw },
    Data,
    InvalidDataError
  >({
    handler: ({ result: data }) => {
      const isData = contract.isData(data);
      if (!isData) {
        throw invalidDataError({
          validationErrors: contract.getErrorMessages(data),
        });
      }

      return data;
    },
    sid: 'ff.applyContractFx',
  });

  return applyContractFx;
}

export { createContractApplier };
