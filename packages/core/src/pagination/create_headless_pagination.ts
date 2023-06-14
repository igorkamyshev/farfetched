import { createStore, createEvent, sample } from 'effector';

import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import {
  DynamicallySourcedField,
  SourcedField,
  and,
  not,
} from '../libs/patronus';
import { Validator } from '../validation/type';
import { Pagination, ParamsAndResult, RequiredPageParams } from './type';
import {
  SharedQueryFactoryConfig,
  createHeadlessQuery,
} from '../query/create_headless_query';

export interface SharedPaginationFactoryConfig<
  Params extends RequiredPageParams,
  Data,
  InitialData = Data
> extends SharedQueryFactoryConfig<Data, InitialData> {
  hasNextPage: (options: ParamsAndResult<Params, Data>) => boolean;
  hasPrevPage: (options: ParamsAndResult<Params, Data>) => boolean;
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
  const { hasNextPage, hasPrevPage, ...queryConfig } = config;

  const operation = createHeadlessQuery<
    Params,
    Response,
    Error,
    ContractData,
    MappedData,
    MapDataSource,
    ValidationSource,
    InitialData
  >(queryConfig);

  const $latestParams = operation.__.$latestParams;

  // Addition stores
  const $page = createStore(0);
  const $hasNext = createStore(false);
  const $hasPrev = createStore(false);

  // Update triggers for page predicates
  const updateCurrentPage = createEvent<ParamsAndResult<Params, MappedData>>();
  const checkExistingPage = createEvent<ParamsAndResult<Params, MappedData>>();

  const next = createEvent();
  const prev = createEvent();
  const specific = createEvent<RequiredPageParams>();

  // Updating predicates
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

  // Forward pagination
  sample({
    clock: next,
    source: { page: $page, params: $latestParams },
    filter: and($hasNext, not(operation.$pending), not(operation.$idle)),
    fn: ({ page, params }) => ({ ...params!, page: page + 1 }),
    target: operation.start,
  });

  sample({
    clock: next,
    source: { page: $page, params: $latestParams },
    filter: not($hasNext),
    fn: ({ page, params = {} }) => ({
      params: { ...(params as Params), page: page + 1 },
      meta: { stopErrorPropagation: false, stale: false },
    }),
    target: operation.finished.skip,
  });

  // Back pagination
  sample({
    clock: prev,
    source: { page: $page, params: $latestParams },
    filter: and($hasPrev, not(operation.$pending), not(operation.$idle)),
    fn: ({ page, params }) => ({ ...params!, page: page - 1 }),
    target: operation.start,
  });

  sample({
    clock: prev,
    source: { page: $page, params: $latestParams },
    filter: not($hasPrev),
    fn: ({ page, params = {} }) => ({
      params: { ...(params as Params), page: page - 1 },
      meta: { stopErrorPropagation: false, stale: false },
    }),
    target: operation.finished.skip,
  });

  // Specific pagination
  sample({
    clock: specific,
    source: $latestParams,
    filter: and(not(operation.$pending), not(operation.$idle)),
    fn: (params, { page }) => ({ ...params!, page }),
    target: operation.start,
  });

  // Addition resets
  sample({
    clock: operation.reset,
    target: [
      $page.reinit!,
      $hasNext.reinit!,
      $hasPrev.reinit!,
      $latestParams.reinit!,
    ],
  });

  // Protocols
  const unitShape = {
    data: operation.$data,
    error: operation.$error,
    pending: operation.$pending,
    stale: operation.$stale,
    page: $page,
    start: operation.start,
    next,
    prev,
    specific,
  };

  const unitShapeProtocol = () => unitShape;

  return {
    ...operation,
    $page,
    $hasNext,
    $hasPrev,
    next,
    prev,
    specific,
    '@@unitShape': unitShapeProtocol,
  };
}
