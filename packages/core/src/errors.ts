type FarfetchedError<T extends string> = { errorType: T; explanation: string };

const INVALID_DATA = 'INVALID_DATA';
interface InvalidDataError extends FarfetchedError<typeof INVALID_DATA> {
  validationErrors: string[];
}
function invalidDataError({
  validationErrors,
}: {
  validationErrors: string[];
}): InvalidDataError {
  return {
    errorType: INVALID_DATA,
    explanation: 'Invalid data',
    validationErrors,
  };
}

const TIMEOUT = 'TIMEOUT';
interface TimeoutError {}

const ABORT = 'ABORT';
interface AbortError {}

const PREPARATION = 'PREPARATION';
interface PreparationError {}

const HTTP = 'HTTP';
interface HttpError {}

export { invalidDataError };

export type {
  InvalidDataError,
  TimeoutError,
  AbortError,
  PreparationError,
  HttpError,
};
