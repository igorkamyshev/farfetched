import {
  type Contract as TypedContract,
  ValidationError,
} from 'typed-contracts';
import { Contract } from '@farfetched/core';

/**
 * Transforms typed-contracts Contract for `data` to internal Contract.
 * Any response which does not conform to `data` will be treated as error.
 *
 * @param data typed-contarcts Contract for valid data
 */
export function typedContract<D>(data: TypedContract<D>): Contract<unknown, D> {
  const NAME = 'value';
  return {
    isData: (raw: unknown): raw is D =>
      !(data(NAME, raw) instanceof ValidationError),
    getErrorMessages(raw) {
      const error = data(NAME, raw);
      if (!(error instanceof ValidationError)) {
        return [];
      }

      return traverseError(error);
    },
  };
}

function traverseError(
  error: ValidationError,
  prevMessages: string[] = []
): string[] {
  const messages: string[] = [...prevMessages];

  if (error.nested.length > 0) {
    const nestedMessages = error.nested.flatMap((e) =>
      traverseError(e, messages)
    );

    return [...messages, ...nestedMessages];
  }

  return [
    ...messages,
    // typed-contracts does not provide a way to get error message in typings
    // https://github.com/bigslycat/typed-contracts/issues/126
    (error as any).message,
  ];
}
