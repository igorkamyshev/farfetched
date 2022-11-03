import { Domain } from 'effector';
import { createStore, sample, createEvent, Store } from 'effector';
import { reset as resetMany } from 'patronum';

import { Contract } from '../contract/type';
import { toInternalDomain } from '../domain/guard_domain';
import { internalDomainSymbol } from '../domain/type';
import { InvalidDataError } from '../errors/type';
import {
  TwoArgsDynamicallySourcedField,
  StaticOrReactive,
} from '../misc/sourced';
import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { serializationForSideStore } from '../serialization/serizalize_for_side_store';
import { Serialize } from '../serialization/type';
import { Validator } from '../validation/type';
import { Query, QueryMeta, QuerySymbol } from './type';

interface SharedQueryFactoryConfig<Data> {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
  serialize?: Serialize<Data>;
  domain?: Domain;
}

/**
 * Creates Query without any executor, it cannot be used as-is.
 *
 * @example
 * const headlessQuery = createHeadlessQuery()
 * headlessQuery.__.executeFx.use(someHandler)
 */
function createHeadlessQuery<
  Params,
  Response,
  Error,
  ContractData extends Response,
  MappedData,
  MapDataSource,
  ValidationSource,
  Initial = null
>({
  initialData,
  contract,
  mapData,
  enabled,
  validate,
  name,
  serialize,
  sources,
  domain,
}: {
  initialData?: Initial;
  contract: Contract<Response, ContractData>;
  mapData: TwoArgsDynamicallySourcedField<
    ContractData,
    Params,
    MappedData,
    MapDataSource
  >;
  validate?: Validator<ContractData, Params, ValidationSource>;
  sources?: Array<Store<unknown>>;
} & SharedQueryFactoryConfig<MappedData>): Query<
  Params,
  MappedData,
  Error | InvalidDataError,
  Initial
> {
  const queryName = name ?? 'unnamed';

  const operation = createRemoteOperation<
    Params,
    Response,
    ContractData,
    MappedData,
    Error,
    QueryMeta<MappedData>,
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
    fn: ({ data }) => data,
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

  resetMany({
    clock: reset,
    target: [$data, $error, $stale, operation.$status],
  });

  const query = {
    $data,
    $error,
    $stale,
    reset,
    ...operation,
  };

  if (domain) {
    toInternalDomain(domain)[internalDomainSymbol].registerQuery(query);
  }

  return query;
}

export { createHeadlessQuery };
export type { SharedQueryFactoryConfig, Serialize };
