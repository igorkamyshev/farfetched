import { type Json } from 'effector';

import {
  ABORT,
  type AbortError,
  HTTP,
  type HttpError,
  INVALID_DATA,
  type InvalidDataError,
  NETWORK,
  type NetworkError,
  PREPARATION,
  type PreparationError,
  TIMEOUT,
  type TimeoutError,
} from './type';

export function invalidDataError(config: {
  validationErrors: string[];
  response: unknown;
}): InvalidDataError {
  return {
    ...config,
    errorType: INVALID_DATA,
    explanation: 'Response was considered as invalid against a given contract',
  };
}

export function timeoutError(config: { timeout: number }): TimeoutError {
  return {
    ...config,
    errorType: TIMEOUT,
    explanation: 'Request was cancelled due to timeout',
  };
}

export function abortError(): AbortError {
  return {
    errorType: ABORT,
    explanation: 'Request was cancelled due to concurrency policy',
  };
}

export function preparationError(config: {
  response: string;
  reason: string | null;
}): PreparationError {
  return {
    ...config,
    errorType: PREPARATION,
    explanation: 'Extraction of data from the response was failed',
  };
}

export function httpError(config: {
  status: number;
  statusText: string;
  response: string | Json | null;
}): HttpError {
  return {
    ...config,
    errorType: HTTP,
    explanation: 'Request was finished with unsuccessful HTTP code',
  };
}

export function networkError(config: {
  reason: string | null;
  cause?: unknown;
}): NetworkError {
  return {
    ...config,
    errorType: NETWORK,
    explanation: 'Request was failed due to network problems',
  };
}
