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
    explanation: 'Response was considered as invalid against a given contract',
    validationErrors,
  };
}

function timeoutError({ timeout }: { timeout: number }): TimeoutError {
  return {
    errorType: TIMEOUT,
    explanation: 'Request was cancelled due to timeout',
    timeout,
  };
}

function abortError(): AbortError {
  return {
    errorType: ABORT,
    explanation: 'Request was cancelled due to concurrency policy',
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
    explanation: 'Extraction of data from the response was failed',
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
    explanation: 'Request was finished with unsuccessful HTTP code',
    status,
    statusText,
    response,
  };
}

function networkError({ reason }: { reason: string | null }): NetworkError {
  return {
    errorType: NETWORK,
    explanation: 'Request was failed due to network problems',
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
