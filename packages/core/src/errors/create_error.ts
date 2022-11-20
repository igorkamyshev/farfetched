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

export function invalidDataError({
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

export function timeoutError({ timeout }: { timeout: number }): TimeoutError {
  return {
    errorType: TIMEOUT,
    explanation: 'Request was cancelled due to timeout',
    timeout,
  };
}

export function abortError(): AbortError {
  return {
    errorType: ABORT,
    explanation: 'Request was cancelled due to concurrency policy',
  };
}

export function preparationError({
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

export function httpError({
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

export function networkError({
  reason,
}: {
  reason: string | null;
}): NetworkError {
  return {
    errorType: NETWORK,
    explanation: 'Request was failed due to network problems',
    reason,
  };
}
