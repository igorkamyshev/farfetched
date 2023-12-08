import { type Details, type Runtype } from 'runtypes';
import { type Contract } from '@farfetched/core';

/**
 * Transforms Runtype contracts for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data Runtype Contract for valid data
 */
function runtypeContract<D>(data: Runtype<D>): Contract<unknown, D> {
  return {
    isData: data.guard,
    getErrorMessages(raw: unknown) {
      const validation = data.validate(raw);
      if (validation.success) {
        return [];
      }

      if (validation.details) {
        return traverseErrorDetails(validation.details);
      }

      return [validation.message];
    },
  };
}

function traverseErrorDetails(
  details: string | Details,
  prevKey?: string,
  curKey?: string
): string[] {
  const nextKey = resolveKey(prevKey, curKey);
  if (typeof details === 'string') {
    if (nextKey) {
      return [`${nextKey}: ${details}`];
    } else {
      return [details];
    }
  }

  if (Array.isArray(details)) {
    return details.flatMap((detail, index) =>
      traverseErrorDetails(detail, nextKey, index.toString())
    );
  }

  return Object.entries(details).flatMap(([key, detail]) =>
    traverseErrorDetails(detail, nextKey, key)
  );
}

function resolveKey(prev?: string, cur?: string): string | undefined {
  if (prev && cur) {
    return `${prev}.${cur}`;
  }
  return prev ?? cur;
}

export { runtypeContract };
