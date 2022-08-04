import { createEffect, Effect } from 'effector';

import { invalidDataError } from '../errors/create_error';
import { InvalidDataError } from '../errors/type';
import { Contract } from './type';

function createContractApplier<Raw, Data extends Raw, Error extends Raw>(
  contract: Contract<Raw, Data, Error>
): Effect<Raw, Data, Error | InvalidDataError> {
  const applyContractFx = createEffect<Raw, Data, Error | InvalidDataError>(
    (response) => {
      const isError = contract.isError(response);
      if (isError) {
        throw response;
      }

      const isData = contract.isData(response);
      if (!isData) {
        throw invalidDataError({
          validationErrors: contract.getValidationErrors(response),
        });
      }

      return response;
    }
  );

  return applyContractFx;
}

export { createContractApplier };
