import {
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
} from 'effector';

import {
  not,
  normalizeSourced,
  normalizeStaticOrReactive,
  type DynamicallySourcedField,
  type StaticOrReactive,
  type FetchingStatus,
  SourcedField,
} from '../libs/patronus';
import { createContractApplier } from '../contract/apply_contract';
import { Contract } from '../contract/type';
import { invalidDataError } from '../errors/create_error';
import { InvalidDataError } from '../errors/type';
import { DataSource, ExecutionMeta } from './type';
import { checkValidationResult } from '../validation/check_validation_result';
import { Validator } from '../validation/type';
import { unwrapValidationResult } from '../validation/unwrap_validation_result';
import { validValidator } from '../validation/valid_validator';
import { RemoteOperation } from './type';
import { get } from '../libs/lohyphen';

export function createRemoteOperation<
  Params,
  Data,
  ContractData extends Data,
  MappedData,
  Error,
  Meta,
  MapDataSource = void,
  ValidationSource = void
>({
  name: ownName,
  meta,
  kind,
  serialize,
  enabled,
  contract,
  validate,
  mapData,
  sourced,
  paramsAreMeaningless,
}: {
  name?: string;
  meta: Meta;
  kind: unknown;
  serialize?: 'ignore';
  enabled?: StaticOrReactive<boolean>;
  contract: Contract<Data, ContractData>;
  validate?: Validator<ContractData, Params, ValidationSource>;
  mapData: DynamicallySourcedField<
    { result: ContractData; params: Params },
    MappedData,
    MapDataSource
  >;
  sourced?: SourcedField<Params, unknown, unknown>[];
  paramsAreMeaningless?: boolean;
}): RemoteOperation<Params, MappedData, Error | InvalidDataError, Meta> {
  const revalidate = createEvent<{ params: Params; refresh: boolean }>();

  const applyContractFx = createContractApplier<Params, Data, ContractData>(
    contract
  );

  const name = ownName ?? 'unnamed';

  // Dummy effect, it will be replaced with real in head-full factory
  const executeFx = createEffect<any, any, any>({
    handler: () => {
      throw new Error('Not implemented');
    },
    sid: `ff.${name}.executeFx`,
    name: `${name}.executeFx`,
  });

  const remoteDataSoruce: DataSource<Params> = {
    name: 'remote_source',
    get: createEffect<
      { params: Params },
      { result: unknown; stale: boolean } | null,
      unknown
    >(async ({ params }) => {
      const result = await executeFx(params);

      return { result, stale: false };
    }),
  };

  const dataSources = [remoteDataSoruce];

  const {
    retrieveDataFx,
    notifyAboutNewValidDataFx,
    notifyAboutDataInvalidationFx,
  } = createDataSourceHandlers<Params>(dataSources);

  /*
   * Start event, it's used as it or to pipe it in head-full factory
   *
   * sample({
   *  clock: externalStart,
   *  target: headlessQuery.start,
   *  greedy: true
   * })
   */
  const start = createEvent<Params>();

  // Signal-events
  const finished = {
    success: createEvent<{
      params: Params;
      result: MappedData;
      meta: ExecutionMeta;
    }>(),
    failure: createEvent<{
      params: Params;
      error: Error | InvalidDataError;
      meta: ExecutionMeta;
    }>(),
    skip: createEvent<{ params: Params; meta: ExecutionMeta }>(),
    finally: createEvent<{ params: Params; meta: ExecutionMeta }>(),
  };

  // -- Main stores --
  const $status = createStore<FetchingStatus>('initial', {
    sid: `ff.${name}.$status`,
    name: `${name}.$status`,
    serialize,
  });

  const $enabled = normalizeStaticOrReactive(enabled ?? true).map(Boolean);

  const $latestParams = createStore<Params | null>(null, {
    serialize: 'ignore',
  });

  // -- Derived stores --
  const $idle = $status.map((status) => status === 'initial');
  const $pending = $status.map((status) => status === 'pending');
  const $failed = $status.map((status) => status === 'fail');
  const $succeeded = $status.map((status) => status === 'done');

  // -- Indicate status --
  sample({
    clock: [
      retrieveDataFx.map(() => 'pending' as const),
      finished.success.map(() => 'done' as const),
      finished.failure.map(() => 'fail' as const),
    ],
    target: $status,
    greedy: true,
  });

  sample({ clock: start, filter: $enabled, target: $latestParams });

  // -- Execution flow
  sample({
    clock: start,
    filter: not($enabled),
    fn(params) {
      return {
        params,
        meta: { stopErrorPropagation: false, stale: false },
      };
    },
    target: finished.skip,
  });

  sample({
    clock: revalidate,
    target: notifyAboutDataInvalidationFx,
  });

  sample({
    clock: notifyAboutDataInvalidationFx.finally,
    source: revalidate,
    filter: ({ refresh }) => refresh,
    fn: ({ params }) => params,
    target: start,
  });

  sample({
    clock: start,
    filter: $enabled,
    fn: (params) => ({ params }),
    target: retrieveDataFx,
  });

  sample({
    clock: retrieveDataFx.done,
    fn: ({ params, result }) => ({
      params: params.params,
      result: result.result as Data,
      meta: { stopErrorPropagation: false, stale: result.stale },
    }),
    filter: $enabled,
    target: applyContractFx,
  });

  sample({
    clock: retrieveDataFx.fail,
    fn: ({ error, params }) => ({
      error: error,
      params: params.params,
      meta: { stopErrorPropagation: false, stale: false },
    }),
    filter: $enabled,
    target: finished.failure,
  });

  const { validDataRecieved, __: invalidDataRecieved } = split(
    sample({
      clock: applyContractFx.done,
      source: normalizeSourced({
        field: validate ?? validValidator,
        clock: applyContractFx.done.map(({ result, params }) => ({
          result,
          params: params.params, // Extract original params, it is params of params
        })),
      }),
      fn: (validation, { params, result }) => ({
        result,
        // Extract original params, it is params of params
        params: params.params,
        validation,
        meta: params.meta,
      }),
    }),
    {
      validDataRecieved: ({ validation }) => checkValidationResult(validation),
    }
  );

  sample({
    clock: validDataRecieved,
    source: normalizeSourced({
      field: mapData,
      clock: validDataRecieved,
    }),
    fn: (result, { params, meta }) => ({
      result,
      params,
      meta,
    }),
    target: finished.success,
  });

  sample({
    clock: finished.success,
    filter: ({ meta }) => meta.stale,
    fn: ({ params }) => ({ params, skipStale: true }),
    target: retrieveDataFx,
  });

  sample({
    clock: validDataRecieved,
    filter: ({ meta }) => !meta.stale,
    target: notifyAboutNewValidDataFx,
  });

  sample({
    clock: applyContractFx.fail,
    filter: ({ params }) => !params.meta.stopErrorPropagation,
    fn: ({ error, params }) => ({
      error,
      // Extract original params, it is params of params
      params: params.params,
      meta: params.meta,
    }),
    target: finished.failure,
  });

  sample({
    clock: invalidDataRecieved,
    filter: ({ meta }) => !meta.stopErrorPropagation,
    fn: ({ params, validation, meta, result }) => ({
      params,
      error: invalidDataError({
        validationErrors: unwrapValidationResult(validation),
        response: result,
      }),
      meta,
    }),
    target: finished.failure,
  });

  // Emit skip for disabling in-flight operation
  sample({
    clock: $enabled.updates,
    source: start,
    filter: not($enabled),
    fn: (params) => ({
      params,
      meta: {
        stopErrorPropagation: false,
        stale: true,
      },
    }),
    target: finished.skip,
  });

  // -- Send finally --
  sample({
    clock: [finished.success, finished.failure, finished.skip],
    fn({ params, meta }) {
      return { params, meta };
    },
    target: finished.finally,
  });

  return {
    start,
    finished,
    $status,
    $idle,
    $pending,
    $failed,
    $succeeded,
    $enabled,
    __: {
      executeFx,
      meta: { ...meta, name },
      kind,
      $latestParams,
      lowLevelAPI: {
        dataSources,
        dataSourceRetrieverFx: retrieveDataFx,
        sourced: sourced ?? [],
        paramsAreMeaningless: paramsAreMeaningless ?? false,
        revalidate,
      },
    },
  };
}

function createDataSourceHandlers<Params>(dataSources: DataSource<Params>[]) {
  const retrieveDataFx = createEffect<
    {
      params: Params;
      skipStale?: boolean;
    },
    { result: unknown; stale: boolean },
    any
  >({
    handler: async ({ params, skipStale }) => {
      for (const dataSource of dataSources) {
        const fromSource = await dataSource.get({ params });

        if (skipStale && fromSource?.stale) {
          continue;
        }

        if (fromSource) {
          return fromSource;
        }
      }

      throw new Error('No data source returned data');
    },
  });

  const notifyAboutNewValidDataFx = createEffect<
    {
      params: Params;
      result: unknown;
    },
    void,
    any
  >({
    handler: async ({ params, result }) => {
      await Promise.all(
        dataSources
          .map(get('set'))
          .filter(Boolean)
          .map((set) => set!({ params, result }))
      );
    },
  });

  const notifyAboutDataInvalidationFx = createEffect<
    {
      params: Params;
    },
    void,
    any
  >({
    handler: async ({ params }) => {
      await Promise.all(
        dataSources
          .map(get('unset'))
          .filter(Boolean)
          .map((unset) => unset!({ params }))
      );
    },
  });

  return {
    retrieveDataFx,
    notifyAboutNewValidDataFx,
    notifyAboutDataInvalidationFx,
  };
}
