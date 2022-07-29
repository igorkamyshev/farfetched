import { createEffect, Effect } from 'effector';
import { invalidDataError, InvalidDataError } from '../errors';
import { Contract } from './type';

function createContractApplier<Raw, Data, Error>(
  contract: Contract<Raw, Data, Error>
): Effect<Raw, Data, Error | InvalidDataError> {
  const applyContractFx = createEffect<Raw, Data, Error | InvalidDataError>(
    (response) => {
      const isError = contract.error.is(response);

      if (isError) {
        const contarctError = contract.error.extract(response);

        throw contarctError;
      }

      const validationErrors = contract.data.validate(response);

      if (validationErrors && validationErrors.length > 0) {
        throw invalidDataError({ validationErrors });
      }

      return contract.data.extract(response);
    }
  );

  return applyContractFx;
}

export { createContractApplier };
