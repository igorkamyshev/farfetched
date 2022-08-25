import { createEffect, Effect } from 'effector';

import { invalidDataError } from '../errors/create_error';
import { InvalidDataError } from '../errors/type';
import { Contract } from './type';

function createContractApplier<
  Params,
  Raw,
  Data extends Raw,
  Error extends Raw
>(
  contract: Contract<Raw, Data, Error>
): Effect<{ params: Params; result: Raw }, Data, Error | InvalidDataError> {
  const applyContractFx = createEffect<
    { params: Params; result: Raw },
    Data,
    Error | InvalidDataError
  >({
    handler: ({ result: data }) => {
      const isError = contract.isError(data);
      if (isError) {
        throw data;
      }

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
