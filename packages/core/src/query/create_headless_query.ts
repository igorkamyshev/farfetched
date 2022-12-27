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
  } & SharedQueryFactoryConfig<MappedData, Initial>
): Query<Params, MappedData, Error | InvalidDataError, Initial> {
  const {
    initialData,
    contract,
    mapData,
    enabled,
    validate,
    name,
    serialize,
    sources,
  } = config;

  const queryName = name ?? 'unnamed';

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
    name: queryName,
    kind: QuerySymbol,
    serialize: serializationForSideStore(serialize),
    enabled,
    meta: { serialize },
    contract,
    validate,
    mapData,
    sources,
  });

  const reset = createEvent();

  // -- Main stores --
  const $data = createStore<MappedData | Initial>(
    initialData ?? (null as unknown as Initial),
    {
      sid: `ff.${queryName}.$data`,
      name: `${queryName}.$data`,
      serialize,
    }
  );
  const $error = createStore<Error | InvalidDataError | null>(null, {
    sid: `ff.${queryName}.$error`,
    name: `${queryName}.$error`,
    serialize: serializationForSideStore(serialize),
  });
  const $stale = createStore<boolean>(false, {
    sid: `ff.${queryName}.$stale`,
    name: `${queryName}.$stale`,
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
    filter: ({ meta }) => !meta.isFreshData,
    fn: () => true,
    target: $stale,
  });

  sample({
    clock: operation.finished.finally,
    filter: ({ meta }) => meta.isFreshData,
    fn: () => false,
    target: $stale,
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

  const unitShapeProtocol = () => ({
    data: $data,
    error: $error,
    stale: $stale,
    pending: operation.$pending,
    start: operation.start,
  });

  const attachProtocol = <NewParams, Source>({
    source,
    mapParams,
  }: {
    source: Store<Source>;
    mapParams: (params: NewParams, source: Source) => Params;
  }) => {
    const attachedQuery = createHeadlessQuery(config);

    const originalHandler = attach({
      source,
      mapParams,
      effect: operation.__.executeFx,
    });
    attachedQuery.__.executeFx.use(originalHandler);

    return attachedQuery as any;
  };

  // -- Public API --

  return {
    $data,
    $error,
    $stale,
    reset,
    ...operation,
    '@@unitShape': unitShapeProtocol,
    '@@attach': attachProtocol,
  };
}
