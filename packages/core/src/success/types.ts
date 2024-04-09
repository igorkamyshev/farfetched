import type { RemoteOperation, ExecutionMeta } from "../remote_operation/type";

export type Before<Request, Response> = RemoteOperation<Request, Response, Error, ExecutionMeta>;

export type After<Request> = RemoteOperation<Request, any, Error, ExecutionMeta>;

export type MapParams<BeforeRequest, BeforeResponse> = {
  params: BeforeRequest,
  result: BeforeResponse,
  meta: ExecutionMeta
}

export type MapParamsFn<BeforeRequest, BeforeResponse, AfterRequest = BeforeResponse> = (params: MapParams<BeforeRequest, BeforeResponse>) => AfterRequest;
