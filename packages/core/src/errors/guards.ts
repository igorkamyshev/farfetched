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

type WithError<T = any, P = Record<string, never>> = P & { error: T };

function isInvalidDataError(
  args: WithError
): args is WithError<InvalidDataError> {
  return args.error?.errorType === INVALID_DATA;
}

function isTimeoutError(args: WithError): args is WithError<TimeoutError> {
  return args.error?.errorType === TIMEOUT;
}

function isAbortError(args: WithError): args is WithError<AbortError> {
  return args.error?.errorType === ABORT;
}

function isPreparationError(
  args: WithError
): args is WithError<PreparationError> {
  return args.error?.errorType === PREPARATION;
}

function isHttpError(args: WithError): args is WithError<HttpError> {
  return args.error?.errorType === HTTP;
}

function isHttpErrorCode<Code extends number>(code: Code) {
  return function isExactHttpError(
    args: WithError
  ): args is WithError<HttpError<Code>> {
    if (!isHttpError(args)) {
      return false;
    }

    return args.error.status === code;
  };
}

function isNetworkError(args: WithError): args is WithError<NetworkError> {
  return args.error?.errorType === NETWORK;
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
