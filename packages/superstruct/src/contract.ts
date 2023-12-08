import { type Struct, is, validate } from 'superstruct';
import { type Contract } from '@farfetched/core';

/**
 * Transforms superstruct Struct for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data superstruct Struct for valid data
 */
export function superstructContract<D>(data: Struct<D>): Contract<unknown, D> {
  return {
    isData: (raw): raw is D => is(raw, data),
    getErrorMessages(raw) {
      const [err] = validate(raw, data);

      if (!err) {
        return [];
      }
      return err
        .failures()
        .map((failure) =>
          [failure.path.join('.'), failure.message].filter(Boolean).join(': ')
        );
    },
  };
}
