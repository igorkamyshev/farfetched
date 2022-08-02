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
interface TimeoutError extends FarfetchedError<typeof TIMEOUT> {
  timeout: number;
}

function timeoutError({ timeout }: { timeout: number }): TimeoutError {
  return {
    errorType: TIMEOUT,
    explanation: `Timeout after ${timeout}ms`,
    timeout,
  };
}

const ABORT = 'ABORT';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AbortError extends FarfetchedError<typeof ABORT> {}

function abortError(): AbortError {
  return {
    errorType: ABORT,
    explanation: 'Request aborted',
  };
}

const PREPARATION = 'PREPARATION';
interface PreparationError extends FarfetchedError<typeof PREPARATION> {
  response: string;
  reason: string | null;
}

function preparationError({
  response,
  reason,
}: {
  response: string;
  reason: string | null;
}): PreparationError {
  return {
    errorType: PREPARATION,
    explanation: 'Preparation error',
    response,
    reason,
  };
}

const HTTP = 'HTTP';
interface HttpError extends FarfetchedError<typeof HTTP> {
  status: number;
  statusText: string;
  response: string | null;
}

function httpError({
  status,
  statusText,
  response,
}: {
  status: number;
  statusText: string;
  response: string | null;
}): HttpError {
  return {
    errorType: HTTP,
    explanation: 'HTTP error',
    status,
    statusText,
    response,
  };
}

const NETWORK = 'NETWORK';
interface NetworkError extends FarfetchedError<typeof NETWORK> {
  reason: string | null;
}

function networkError({ reason }: { reason: string | null }): NetworkError {
  return {
    errorType: NETWORK,
    explanation: 'Network error',
    reason,
  };
}

export {
  invalidDataError,
  timeoutError,
  abortError,
  preparationError,
  httpError,
  networkError,
};

export type {
  InvalidDataError,
  TimeoutError,
  AbortError,
  PreparationError,
  HttpError,
  NetworkError,
};
