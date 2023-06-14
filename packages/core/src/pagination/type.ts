import { Event, Store } from 'effector';
import { Serialize } from '../libs/patronus';
import { RemoteOperation } from '../remote_operation/type';

export const PaginationSymbol = Symbol('Pagination');

export interface ParamsAndResult<Params, Result> {
  params: Params;
  result: Result;
}

export interface RequiredPageParams {
  page: number;
}

export interface PaginationMeta<Data, InitialData = Data> {
  readonly serialize: Serialize<Data | InitialData>;
  readonly initialData: InitialData;
}

export interface Pagination<
  Params extends RequiredPageParams,
  Data,
  Error,
  InitialData = null
> extends RemoteOperation<
    Params,
    Data,
    Error,
    PaginationMeta<Data, InitialData>
  > {
  $data: Store<Data | InitialData>;
  $error: Store<Error | null>;
  $page: Store<number>;
  $hasNext: Store<boolean>;
  $hasPrev: Store<boolean>;

  reset: Event<void>;
  next: Event<void>;
  prev: Event<void>;
  specific: Event<RequiredPageParams>;

  readonly '@@unitShape': () => {
    data: Store<Data | InitialData>;
    error: Store<Error | null>;
    page: Store<number>;
    pending: Store<boolean>;
    start: Event<Params>;
    next: Event<void>;
    prev: Event<void>;
    specific: Event<RequiredPageParams>;
  };
}

export function isPagination(value: any): value is Pagination<any, any, any> {
  return value?.__?.kind === PaginationSymbol;
}
