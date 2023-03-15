import { createStore, sample, createEvent, Store, attach } from 'effector';

import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import {
  serializationForSideStore,
  type Serialize,
  type StaticOrReactive,
  type DynamicallySourcedField,
} from '../libs/patronus';
import { Validator } from '../validation/type';
import { Query, QueryMeta, QuerySymbol } from './type';
import { Event } from 'effector';
import { isEqual } from '../libs/lohyphen';

export interface SharedQueryFactoryConfig<Data, Initial = Data> {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
  serialize?: Serialize<Data | Initial>;
}

/**
 * Creates Query without any executor, it cannot be used as-is.
 *
 * @example
 * const headlessQuery = createHeadlessQuery()
 * headlessQuery.__.executeFx.use(someHandler)
 */
export function createHeadlessQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource,
  Initial = null
>(
  config: {
    initialData?: Initial;
    contract: Contract<Response, ContractData>;
    mapData: DynamicallySourcedField<
      { result: ContractData; params: Params },
      MappedData,
      MapDataSource
    >;
    validate?: Validator<ContractData, Params, ValidationSource>;
    sources?: Array<Store<unknown>>;
    sourced?: Array<(clock: Event<Params>) => Store<unknown>>;
    paramsAreMeaningless?: boolean;
  } & SharedQueryFactoryConfig<MappedData, Initial>
): Query<Params, MappedData, Error | InvalidDataError, Initial> {
  const {
    initialData: initialDataRaw,
    contract,
    mapData,
    enabled,
    validate,
    name,
    serialize,
    sources,
    sourced,
    paramsAreMeaningless,
  } = config;

  const initialData = initialDataRaw ?? (null as unknown as Initial);

  const operation = createRemoteOperation<
    Params,
    Response,
    ContractData,
    MappedData,
    Error,
    QueryMeta<MappedData, Initial>,
    MapDataSource,
    ValidationSource
  >({
    name,
    kind: QuerySymbol,
    serialize: serializationForSideStore(serialize),
    enabled,
    meta: { serialize, initialData },
    contract,
    validate,
    mapData,
    sources,
    sourced,
    paramsAreMeaningless,
  });

  const refresh = createEvent<Params>();
  const reset = createEvent();

  // -- Main stores --
  const $data = createStore<MappedData | Initial>(initialData, {
    sid: `ff.${operation.__.meta.name}.$data`,
    name: `${operation.__.meta.name}.$data`,
    serialize,
  });
  const $error = createStore<Error | InvalidDataError | null>(null, {
    sid: `ff.${operation.__.meta.name}.$error`,
    name: `${operation.__.meta.name}.$error`,
    serialize: serializationForSideStore(serialize),
  });
  const $stale = createStore<boolean>(true, {
    sid: `ff.${operation.__.meta.name}.$stale`,
    name: `${operation.__.meta.name}.$stale`,
    serialize: serializationForSideStore(serialize),
  });

  sample({ clock: operation.finished.success, fn: () => null, target: $error });
  sample({
    clock: operation.finished.success,
    fn: ({ result }) => result,
    target: $data,
  });

  $data.reset(operation.finished.failure);
  sample({
    clock: operation.finished.failure,
    fn: ({ error }) => error,
    target: $error,
  });

  // -- Handle stale

  sample({
    clock: operation.finished.finally,
    fn: ({ meta }) => !meta.isFreshData,
    target: $stale,
  });

  // -- Trigger API

  sample({
    clock: refresh,
    source: { stale: $stale, latestParams: operation.__.$latestParams },
    filter: ({ stale, latestParams }, params) =>
      stale || !isEqual(params ?? null, latestParams),
    fn: (_, params) => params,
    target: operation.start,
  });

  // -- Reset state --

  sample({
    clock: reset,
    target: [
      $data.reinit!,
      $error.reinit!,
      $stale.reinit!,
      operation.$status.reinit!,
    ],
  });

  // -- Protocols --

  const unitShape = {
    data: $data,
    error: $error,
    stale: $stale,
    pending: operation.$pending,
    start: operation.start,
  };
  const unitShapeProtocol = () => unitShape;

  // Experimental API, won't be exposed as protocol for now
  const attachProtocol = <NewParams, Source>({
    source,
    mapParams,
  }: {
    source: Store<Source>;
    mapParams: (params: NewParams, source: Source) => Params;
  }) => {
    const attachedQuery = createHeadlessQuery<
      NewParams,
      Response,
      unknown,
      ContractData,
      MappedData,
      MapDataSource,
      ValidationSource,
      Initial
    >(config as any);

    attachedQuery.__.lowLevelAPI.dataSourceRetrieverFx.use(
      attach({
        source,
        mapParams: (
          { params, ...rest }: { params: NewParams },
          sourceValue
        ): { params: Params } => ({
          params: (mapParams
            ? mapParams(params, sourceValue)
            : params) as Params,
          ...rest,
        }),
        effect: operation.__.lowLevelAPI.dataSourceRetrieverFx,
      })
    );

    return attachedQuery;
  };

  // -- Public API --

  return {
    $data,
    $error,
    $stale,
    reset,
    refresh,
    ...operation,
    __: {
      ...operation.__,
      experimentalAPI: { attach: attachProtocol },
    },
    '@@unitShape': unitShapeProtocol,
  };
}
