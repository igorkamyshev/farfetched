import { createStore, createEvent, sample } from 'effector';

import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import {
  DynamicallySourcedField,
  Serialize,
  SourcedField,
  StaticOrReactive,
  and,
  not,
  serializationForSideStore,
} from '../libs/patronus';
import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { Validator } from '../validation/type';
import {
  Pagination,
  PaginationMeta,
  PaginationSymbol,
  ParamsAndResult,
  RequiredPageParams,
} from './type';

export interface SharedPaginationFactoryConfig<
  Params extends RequiredPageParams,
  Data,
  InitialData = Data
> {
  hasNextPage: (options: ParamsAndResult<Params, Data>) => boolean;
  hasPrevPage: (options: ParamsAndResult<Params, Data>) => boolean;
  name?: string;
  enabled?: StaticOrReactive<boolean>;
  serialize?: Serialize<Data | InitialData>;
}

export interface HeadlessPaginationFactoryConfig<
  Params extends RequiredPageParams,
  Response,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource,
  InitialData = null
> extends SharedPaginationFactoryConfig<Params, MappedData, InitialData> {
  initialData?: InitialData;
  contract: Contract<Response, ContractData>;
  mapData: DynamicallySourcedField<
    ParamsAndResult<Params, ContractData>,
    MappedData,
    MapDataSource
  >;
  validate?: Validator<ContractData, Params, ValidationSource>;
  sourced?: SourcedField<Params, unknown, unknown>[];
  paramsAreMeaningless?: boolean;
}

export function createHeadlessPagination<
  Params extends RequiredPageParams,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource,
  InitialData = null
>(
  config: HeadlessPaginationFactoryConfig<
    Params,
    Response,
    ContractData,
    MappedData,
    MapDataSource,
    ValidationSource,
    InitialData
  >
): Pagination<Params, MappedData, Error | InvalidDataError, InitialData> {
  const {
    name,
    enabled,
    serialize,
    contract,
    initialData: initialDataRaw,
    paramsAreMeaningless,
    sourced,
    validate,
    mapData,
    hasNextPage,
    hasPrevPage,
  } = config;
  const initialData = (initialDataRaw ?? null) as InitialData;

  const operation = createRemoteOperation<
    Params,
    Response,
    ContractData,
    MappedData,
    Error,
    PaginationMeta<MappedData, InitialData>,
    MapDataSource,
    ValidationSource
  >({
    name,
    kind: PaginationSymbol,
    meta: { serialize, initialData },
    enabled,
    serialize: serializationForSideStore(serialize),
    contract,
    paramsAreMeaningless,
    sourced,
    validate,
    mapData,
  });

  const $data = createStore<MappedData | InitialData>(initialData);
  const $error = createStore<Error | InvalidDataError | null>(null);

  const $lastParams = operation.__.$latestParams;
  const $hasLatestParams = $lastParams.map((params) => params !== null);

  const $page = createStore(0);
  const $hasNext = createStore(false);
  const $hasPrev = createStore(false);
  const updateCurrentPage = createEvent<ParamsAndResult<Params, MappedData>>();
  const checkExistingPage = createEvent<ParamsAndResult<Params, MappedData>>();

  const reset = createEvent();
  const next = createEvent();
  const prev = createEvent();
  const specific = createEvent<number>();

  sample({
    clock: operation.finished.success,
    fn: ({ params, result }) => ({ params, result }),
    target: [updateCurrentPage, checkExistingPage],
  });

  sample({
    clock: updateCurrentPage,
    fn: ({ params }) => params.page,
    target: $page,
  });

  sample({
    clock: checkExistingPage,
    fn: hasNextPage,
    target: $hasNext,
  });

  sample({
    clock: checkExistingPage,
    fn: hasPrevPage,
    target: $hasPrev,
  });

  sample({
    clock: next,
    source: { page: $page, params: $lastParams },
    filter: and($hasNext, not(operation.$pending), $hasLatestParams),
    fn: ({ page, params }) => ({ ...params!, page: page + 1 }),
    target: operation.__.executeFx,
  });

  sample({
    clock: prev,
    source: { page: $page, params: $lastParams },
    filter: and($hasPrev, not(operation.$pending), $hasLatestParams),
    fn: ({ page, params }) => ({ ...params!, page: page - 1 }),
    target: operation.__.executeFx,
  });

  sample({
    clock: specific,
    source: $lastParams,
    filter: and(not(operation.$pending), $hasLatestParams),
    fn: (params, page) => ({ ...params!, page }),
    target: operation.__.executeFx,
  });

  sample({
    clock: reset,
    target: [
      $data.reinit!,
      $error.reinit!,
      $page.reinit!,
      $hasNext.reinit!,
      $hasPrev.reinit!,
    ],
  });

  const unitShape = {
    data: $data,
    error: $error,
    pending: operation.$pending,
    page: $page,
    start: operation.start,
    next,
    prev,
    specific,
  };

  const unitShapeProtocol = () => unitShape;

  return {
    $data,
    $error,
    $page,
    $hasNext,
    $hasPrev,
    reset,
    next,
    prev,
    specific,
    ...operation,
    '@@unitShape': unitShapeProtocol,
  };
}
