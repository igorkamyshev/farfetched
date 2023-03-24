import {
  createStore,
  sample,
  createEvent,
  attach,
  withRegion,
  type Store,
  type Event,
} from 'effector';

import { type Contract } from '../contract/type';
import { type InvalidDataError } from '../errors/type';
import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import {
  postpone,
  serializationForSideStore,
  type Serialize,
  type StaticOrReactive,
  type DynamicallySourcedField,
  type SourcedField,
} from '../libs/patronus';
import { type Validator } from '../validation/type';
import { type Query, type QueryMeta, QuerySymbol } from './type';
import { isEqual } from '../libs/lohyphen';
import { createMetaNode } from '../inspect/node';

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
    sourced?: SourcedField<Params, unknown, unknown>[];
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
    sourced,
    paramsAreMeaningless,
  } = config;

  const initialData = initialDataRaw ?? (null as unknown as Initial);

  const node = createMetaNode({ type: 'query' });

  return withRegion(node, () => {
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
      meta: { serialize, initialData, node },
      contract,
      validate,
      mapData,
      sourced,
      paramsAreMeaningless,
    });

    const refresh = createEvent<Params>();
    const reset = createEvent();

    // -- Main stores --
    const $data = withRegion(
      createMetaNode({ type: 'info', name: 'data' }),
      () =>
        createStore<MappedData | Initial>(initialData, {
          sid: `ff.${operation.__.meta.name}.$data`,
          name: `${operation.__.meta.name}.$data`,
          serialize,
        })
    );
    const $error = withRegion(
      createMetaNode({ type: 'info', name: 'error' }),
      () =>
        createStore<Error | InvalidDataError | null>(null, {
          sid: `ff.${operation.__.meta.name}.$error`,
          name: `${operation.__.meta.name}.$error`,
          serialize: serializationForSideStore(serialize),
        })
    );
    const $stale = createStore<boolean>(true, {
      sid: `ff.${operation.__.meta.name}.$stale`,
      name: `${operation.__.meta.name}.$stale`,
      serialize: serializationForSideStore(serialize),
    });

    sample({
      clock: operation.finished.success,
      fn: () => null,
      target: $error,
    });
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
      fn: ({ meta }) => meta.stale,
      target: $stale,
    });

    // -- Trigger API

    const postponedRefresh: Event<Params> = postpone({
      clock: refresh,
      until: operation.$enabled,
    });

    sample({
      clock: postponedRefresh,
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

      const originalHandler = attach({
        source,
        mapParams,
        effect: operation.__.executeFx,
      });
      attachedQuery.__.executeFx.use(originalHandler);

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
  });
}
