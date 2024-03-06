import { type Contract } from '@farfetched/core';
import { type BaseSchema, safeParse } from 'valibot';

/**
 * Transforms Valibot Schema for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param {BaseSchema} data Valibot Contract for valid data
 */
function valibotContract<D>(data: BaseSchema<D>): Contract<unknown, D> {
  return {
    isData(prepared: unknown): prepared is D {
      return safeParse(data, prepared).success;
    },
    getErrorMessages(raw) {
      const validation = safeParse(data, raw);
      if (validation.success) {
        return [];
      }

      return validation.issues.map((e) => {
        const path = e.path?.map((p) => p.key).join('.');
        return path ? `${e.message}, path: ${path}` : e.message;
      });
    },
  };
}

export { valibotContract };
