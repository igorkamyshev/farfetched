// Contract public API
export { type Contract } from './src/contract/type';
export { unknownContract } from './src/contract/unknown_contract';

// Query public API
export { type Query } from './src/query/type';
export { createQuery } from './src/query/create_query';
export { connectQuery } from './src/query/connect_query';
export { createHeadlessQuery } from './src/query/create_headless_query';
export { createJsonQuery } from './src/query/create_json_query';

// Mutation public API
export { type Mutation } from './src/mutation/type';
export { createMutation } from './src/mutation/create_mutation';
export { createHeadlessMutation } from './src/mutation/create_headless_mutation';
export { createJsonMutation } from './src/mutation/create_json_mutation';

// Retry public API
export { retry } from './src/retry/retry';
export { exponentialDelay, linearDelay } from './src/retry/delay';

// Cache public API
export { cache } from './src/cache/cache';
export { externalCache } from './src/cache/adapters/external';
export { inMemoryCache } from './src/cache/adapters/in_memory';
export { localStorageCache } from './src/cache/adapters/local_storage';
export { sessionStorageCache } from './src/cache/adapters/session_storage';
export { voidCache } from './src/cache/adapters/void';

// Exposed libs
export {
  type SourcedField,
  normalizeSourced,
  type DynamicallySourcedField,
} from './src/libs/patronus';
export { type FetchingStatus } from './src/libs/patronus';

// RemoteOperation public API
export {
  declareParams,
  type ParamsDeclaration,
} from './src/remote_operation/params';

// Validation public API
export { type ValidationResult, type Validator } from './src/validation/type';

// Exposed fetch
export { type Json, type JsonObject } from './src/fetch/json';

// Exposed errors
export {
  type FarfetchedError,
  type InvalidDataError,
  type TimeoutError,
  type AbortError,
  type PreparationError,
  type HttpError,
  type NetworkError,
} from './src/errors/type';
export {
  invalidDataError,
  timeoutError,
  abortError,
  preparationError,
  httpError,
  networkError,
} from './src/errors/create_error';
export {
  isTimeoutError,
  isAbortError,
  isPreparationError,
  isHttpError,
  isNetworkError,
  isInvalidDataError,
  isHttpErrorCode,
} from './src/errors/guards';
