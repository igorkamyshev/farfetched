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

function isInvalidDataError(error: any): error is InvalidDataError {
  return error?.errorType === INVALID_DATA;
}

function isTimeoutError(error: any): error is TimeoutError {
  return error?.errorType === TIMEOUT;
}

function isAbortError(error: any): error is AbortError {
  return error?.errorType === ABORT;
}

function isPreparationError(error: any): error is PreparationError {
  return error.errorType === PREPARATION;
}

function isHttpError(error: any): error is HttpError {
  return error.errorType === HTTP;
}

function isHttpErrorCode<Code extends number>(code: Code) {
  return function isExactHttpError(error: any): error is HttpError<Code> {
    if (!isHttpError(error)) {
      return false;
    }

    return error.status === code;
  };
}

function isNetworkError(error: any): error is NetworkError {
  return error.errorType === NETWORK;
}

export {
  isTimeoutError,
  isAbortError,
  isPreparationError,
  isHttpError,
  isNetworkError,
  isInvalidDataError,
  isHttpErrorCode,
};
