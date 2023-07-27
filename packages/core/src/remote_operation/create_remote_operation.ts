import {
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
} from 'effector';

import {
  not,
  readonly,
  normalizeSourced,
  normalizeStaticOrReactive,
  type DynamicallySourcedField,
  type StaticOrReactive,
  type FetchingStatus,
  type SourcedField,
} from '../libs/patronus';
import { createContractApplier } from '../contract/apply_contract';
import { type Contract } from '../contract/type';
import { invalidDataError } from '../errors/create_error';
import { type InvalidDataError } from '../errors/type';
import { type DataSource, type ExecutionMeta } from './type';
import { checkValidationResult } from '../validation/check_validation_result';
import { type Validator } from '../validation/type';
import { unwrapValidationResult } from '../validation/unwrap_validation_result';
import { validValidator } from '../validation/valid_validator';
import { type RemoteOperation } from './type';
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
  const pushData = createEvent<MappedData>();
  const pushError = createEvent<Error | InvalidDataError>();
  const startWithMeta = createEvent<{ params: Params; meta: ExecutionMeta }>();

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
      { stopErrorPropagation: boolean; error: unknown }
    >(async ({ params }) => {
      try {
        const result = await executeFx(params);
        return { result, stale: false };
      } catch (error) {
        throw { stopErrorPropagation: false, error };
      }
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

  sample({
    clock: start,
    fn: (params) => ({
      params,
      meta: { stopErrorPropagation: false, stale: true },
    }),
    target: startWithMeta,
  });

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
  });

  sample({
    clock: startWithMeta,
    filter: $enabled,
    fn: ({ params }) => params,
    target: $latestParams,
  });

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
    fn: ({ params }) => ({
      params,
      meta: { stopErrorPropagation: false, stale: true },
    }),
    target: notifyAboutDataInvalidationFx,
  });

  sample({
    clock: notifyAboutDataInvalidationFx.finally,
    source: revalidate,
    filter: ({ refresh }) => refresh,
    fn: ({ params }) => ({
      params,
      meta: { stopErrorPropagation: false, stale: true },
    }),
    target: startWithMeta,
  });

  sample({
    clock: startWithMeta,
    filter: $enabled,
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
    source: $enabled,
    filter: (enabled, { error }) => enabled && !error.stopErrorPropagation,
    fn: (_, { error, params }) => ({
      error: error.error as any,
      params: params.params,
      meta: { stopErrorPropagation: error.stopErrorPropagation, stale: false },
    }),
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
    fn: ({ params, meta }) => ({ params, meta, skipStale: true }),
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
      $latestParams: readonly($latestParams),
      lowLevelAPI: {
        dataSources,
        dataSourceRetrieverFx: retrieveDataFx,
        sourced: sourced ?? [],
        paramsAreMeaningless: paramsAreMeaningless ?? false,
        revalidate,
        pushError,
        pushData,
        startWithMeta,
      },
    },
  };
}

function createDataSourceHandlers<Params>(dataSources: DataSource<Params>[]) {
  const retrieveDataFx = createEffect<
    {
      params: Params;
      skipStale?: boolean;
      meta: ExecutionMeta;
    },
    { result: unknown; stale: boolean },
    { stopErrorPropagation: boolean; error: unknown }
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

      throw {
        stopErrorPropagation: false,
        error: new Error('No data source returned data'),
      };
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
