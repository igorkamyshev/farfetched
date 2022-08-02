import {
  ABORT,
  AbortError,
  HTTP,
  HttpError,
  InvalidDataError,
  INVALID_DATA,
  NETWORK,
  NetworkError,
  PREPARATION,
  PreparationError,
  TIMEOUT,
  TimeoutError,
} from './type';

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

function timeoutError({ timeout }: { timeout: number }): TimeoutError {
  return {
    errorType: TIMEOUT,
    explanation: `Timeout after ${timeout}ms`,
    timeout,
  };
}

function abortError(): AbortError {
  return {
    errorType: ABORT,
    explanation: 'Request aborted',
  };
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
