import { Runtype } from 'runtypes';
import { Contract } from '@farfetched/core';

/**
 * Transforms Runtype contracts for `data` and `error` to internal Contract
 */
function runtypeContract<D, E>(config: {
  /** Runtype Contract for valid data */
  data: Runtype<D>;
  /** Runtype contract for error response */
  error: Runtype<E>;
}): Contract<unknown, D, E>;

/**
 * Transforms Runtype contracts for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data Runtype Contract for valid data
 */
function runtypeContract<D>(data: Runtype<D>): Contract<unknown, D, unknown>;

// Implementation
function runtypeContract(config: any) {
  if (config.data && config.error) {
    return createRuntypeContractFull(config);
  }

  return createRuntypeContractShort(config);
}

function createRuntypeContractFull<D, E>({
  data,
  error,
}: {
  data: Runtype<D>;
  error: Runtype<E>;
}): Contract<unknown, D, E> {
  return {
    data: {
      validate: (raw) => {
        const validation = data.validate(raw);
        if (validation.success) {
          return null;
        }

        return [validation.message];
      },
      extract: (raw) => data.check(raw),
    },
    error: {
      is: (raw) => error.guard(raw),
      extract: (raw) => error.check(raw),
    },
  };
}

function createRuntypeContractShort<D>(
  data: Runtype<D>
): Contract<unknown, D, unknown> {
  return {
    data: {
      validate: (raw) => {
        const validation = data.validate(raw);
        if (validation.success) {
          return null;
        }

        return [validation.message];
      },
      extract: (raw) => data.check(raw),
    },
    error: {
      is: (raw) => !data.guard(raw),
      extract: (raw) => {
        if (data.guard(raw)) {
          throw new Error(
            'Logic exception! You are trying to extract error from valid response'
          );
        }

        return raw;
      },
    },
  };
}

export { runtypeContract };
