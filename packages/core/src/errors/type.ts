type FarfetchedError<T extends string> = { errorType: T; explanation: string };

const INVALID_DATA = 'INVALID_DATA';
interface InvalidDataError extends FarfetchedError<typeof INVALID_DATA> {
  validationErrors: string[];
}

const TIMEOUT = 'TIMEOUT';
interface TimeoutError extends FarfetchedError<typeof TIMEOUT> {
  timeout: number;
}

const ABORT = 'ABORT';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AbortError extends FarfetchedError<typeof ABORT> {}

const PREPARATION = 'PREPARATION';
interface PreparationError extends FarfetchedError<typeof PREPARATION> {
  response: string;
  reason: string | null;
}

const HTTP = 'HTTP';
interface HttpError extends FarfetchedError<typeof HTTP> {
  status: number;
  statusText: string;
  response: string | null;
}

const NETWORK = 'NETWORK';
interface NetworkError extends FarfetchedError<typeof NETWORK> {
  reason: string | null;
}

export { INVALID_DATA, TIMEOUT, ABORT, PREPARATION, HTTP, NETWORK };

export type {
  FarfetchedError,
  InvalidDataError,
  TimeoutError,
  AbortError,
  PreparationError,
  HttpError,
  NetworkError,
};
