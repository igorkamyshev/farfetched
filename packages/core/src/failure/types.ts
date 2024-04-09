import type { RemoteOperation, ExecutionMeta } from "../remote_operation/type";

export type Before<Request, BeforeError = Error> = RemoteOperation<Request, any, BeforeError, ExecutionMeta>;

export type After<Request> = RemoteOperation<Request, any, Error, ExecutionMeta>;

export type MapParams<BeforeRequest, BeforeError> = {
  params: BeforeRequest,
  error: BeforeError,
  meta: ExecutionMeta
}

export type MapParamsFn<BeforeRequest, BeforeError, AfterRequest = BeforeError> = (params: MapParams<BeforeRequest, BeforeError>) => AfterRequest;
