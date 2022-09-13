import { Runtype } from 'runtypes';
import { Contract } from '@farfetched/core';

/**
 * Transforms Runtype contracts for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data Runtype Contract for valid data
 */
function runtypeContract<D>(data: Runtype<D>): Contract<unknown, D> {
  return {
    isData: data.guard,
    getErrorMessages(raw) {
      const validation = data.validate(raw);
      if (validation.success) {
        return [];
      }

      return [validation.message];
    },
  };
}

export { runtypeContract };
