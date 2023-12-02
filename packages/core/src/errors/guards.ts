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
  CONFIGURATION,
  type ConfigurationError,
} from './type';

type WithError<T = any, P = Record<string, unknown>> = P & { error: T };

export function isInvalidDataError(
  args: WithError
): args is WithError<InvalidDataError> {
  return args.error?.errorType === INVALID_DATA;
}

export function isTimeoutError(
  args: WithError
): args is WithError<TimeoutError> {
  return args.error?.errorType === TIMEOUT;
}

/**
 * Has to be private, do not export it.
 *
 * Since Farfetcehd 0.10 aborted RemoteOperation is not considered as an error,
 * so isAbortError is not needed anymore in userland.
 */
export function isAbortError(args: WithError): args is WithError<AbortError> {
  return args.error?.errorType === ABORT;
}

export function isPreparationError(
  args: WithError
): args is WithError<PreparationError> {
  return args.error?.errorType === PREPARATION;
}

export function isHttpError(args: WithError): args is WithError<HttpError> {
  return args.error?.errorType === HTTP;
}

export function isHttpErrorCode<Code extends number>(code: Code | Code[]) {
  return function isExactHttpError(
    args: WithError
  ): args is WithError<HttpError<Code>> {
    if (!isHttpError(args)) {
      return false;
    }

    const codes = Array.isArray(code) ? code : [code];

    return codes.includes(args.error.status as any);
  };
}

export function isNetworkError(
  args: WithError
): args is WithError<NetworkError> {
  return args.error?.errorType === NETWORK;
}

export function isConfigurationError(
  args: WithError
): args is WithError<ConfigurationError> {
  return args.error?.errorType === CONFIGURATION;
}
