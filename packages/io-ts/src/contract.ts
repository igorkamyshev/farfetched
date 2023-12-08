import { type Type } from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { type Contract } from '@farfetched/core';

/**
 * Transforms io-ts Type for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data io-ts Type for valid data
 */
export function ioTsContract<D>(data: Type<D>): Contract<unknown, D> {
  return {
    isData: data.is,
    getErrorMessages(raw) {
      if (data.is(raw)) {
        return [];
      }
      return PathReporter.report(data.decode(raw));
    },
  };
}
