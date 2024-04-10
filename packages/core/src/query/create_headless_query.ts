import {
  type Store,
  type Event,
  createStore,
  sample,
  createEvent,
  attach,
  split,
  withRegion,
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
import { type ExecutionMeta } from '../remote_operation/type';
import { isEqual } from '../libs/lohyphen';
import { readonly } from '../libs/patronus';
import { createMetaNode } from '../inspect';

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
  Initial = null,
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
    meta: {
      serialize,
      initialData,
      sid: querySid(createStore(null, { sid: 'dummy' })),
    },
    contract,
    validate,
    mapData,
    sourced,
    paramsAreMeaningless,
  });

  const refresh = createEvent<Params>();

  // -- Main stores --
  const $data = createStore<MappedData | Initial>(initialData, {
    sid: `ff.${operation.__.meta.name}.$data`,
    name: `${operation.__.meta.name}.$data`,
    serialize,
    skipVoid: false,
  });
  const $error = createStore<Error | InvalidDataError | null>(null, {
    sid: `ff.${operation.__.meta.name}.$error`,
    name: `${operation.__.meta.name}.$error`,
    serialize: serializationForSideStore(serialize),
    skipVoid: false,
  });
  const $stale = createStore<boolean>(true, {
    sid: `ff.${operation.__.meta.name}.$stale`,
    name: `${operation.__.meta.name}.$stale`,
    serialize: serializationForSideStore(serialize),
    skipVoid: false,
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

  sample({
    clock: operation.__.lowLevelAPI.pushData,
    target: [$data, $error.reinit],
  });

  sample({
    clock: operation.__.lowLevelAPI.pushError,
    target: [$error, $data.reinit],
  });

  // -- Trigger API

  const postponedRefresh: Event<Params> = postpone({
    clock: refresh,
    until: operation.$enabled,
  });

  const refreshSkipDueToFreshness = createEvent<void>();

  const { haveToStart, __: haveToSkip } = split(
    sample({
      clock: postponedRefresh,
      source: { stale: $stale, latestParams: operation.__.$latestParams },
      fn: ({ stale, latestParams }, params) => ({
        haveToStart: stale || !isEqual(params, latestParams),
        params,
      }),
    }),
    {
      haveToStart: ({ haveToStart }) => haveToStart,
    }
  );

  sample({
    clock: haveToSkip,
    fn: () => null,
    target: refreshSkipDueToFreshness,
  });
  sample({
    clock: haveToStart,
    fn: ({ params }) => params,
    target: operation.start,
  });

  // -- Reset state --

  sample({
    clock: operation.reset,
    target: [$data.reinit, $error.reinit, $stale.reinit],
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
          { params, ...rest }: { params: NewParams; meta: ExecutionMeta },
          sourceValue
        ): { params: Params; meta: ExecutionMeta } => ({
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

  const metaNode = createMetaNode(
    { type: 'query', name: config.name },
    { $status: operation.$status, $data, $error }
  );

  return withRegion(metaNode, () => {
    return {
      refresh,
      start: operation.start,
      reset: operation.reset,
      started: readonly(operation.started),
      $data: readonly($data),
      $error: readonly($error),
      $status: readonly(operation.$status),
      $idle: readonly(operation.$idle),
      $pending: readonly(operation.$pending),
      $succeeded: readonly(operation.$succeeded),
      $failed: readonly(operation.$failed),
      $finished: readonly(operation.$finished),
      $enabled: readonly(operation.$enabled),
      $stale,
      aborted: readonly(operation.aborted),
      finished: {
        success: readonly(operation.finished.success),
        failure: readonly(operation.finished.failure),
        finally: readonly(operation.finished.finally),
        skip: readonly(operation.finished.skip),
      },
      __: {
        ...operation.__,
        lowLevelAPI: { ...operation.__.lowLevelAPI, refreshSkipDueToFreshness },
        experimentalAPI: { attach: attachProtocol },
      },
      '@@unitShape': unitShapeProtocol,
    };
  });
}

function querySid($data: Store<any>): string | null {
  const sid = $data.sid;

  if (!sid?.includes('|')) {
    return null;
  }

  return sid;
}
