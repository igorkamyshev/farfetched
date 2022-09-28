import { ZodType } from 'zod';
import { Contract } from '@farfetched/core';

/**
 * Transforms Runtype contracts for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data Runtype Contract for valid data
 */
function zodContract<D>(data: ZodType<D>): Contract<unknown, D> {
  function isData(prepared: unknown): prepared is D {
    return data.safeParse(prepared).success;
  }

  return {
    isData,
    getErrorMessages(raw) {
      const validation = data.safeParse(raw);
      if (validation.success) {
        return [];
      }

      return validation.error.errors.map((e) => e.message);
    },
  };
}

export { zodContract };
