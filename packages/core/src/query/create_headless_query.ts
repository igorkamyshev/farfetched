import { createEffect, createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';

import { createContractApplier } from '../contract/apply_contract';
import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import {
  normalizeSourced,
  TwoArgsSourcedField,
  reduceTwoArgs,
  StaticOrReactive,
  normalizeStaticOrReactive,
} from '../misc/sourced';
import { FetchingStatus } from '../status/type';
import { Query } from './type';

interface SharedQueryFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
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
  ContractError extends Response,
  MappedData,
  MapDataSource
>({
  contract,
  mapData,
  enabled,
  name,
}: {
  contract: Contract<Response, ContractData, ContractError>;
  mapData: TwoArgsSourcedField<ContractData, Params, MappedData, MapDataSource>;
} & SharedQueryFactoryConfig): Query<
  Params,
  MappedData,
  Error | InvalidDataError | ContractError
> {
  const queryName = name ?? 'unnamed';

  // Dummy effect, it will be replaced with real in head-full query creator
  const executeFx = createEffect<Params, Response, Error>({
    handler: () => {
      throw new Error('Not implemented');
    },
    sid: `ff.${queryName}.executeFx`,
    name: `${queryName}.executeFx`,
  });

  const applyContractFx = createContractApplier<
    Params,
    Response,
    ContractData,
    ContractError
  >(contract);

  /*
   * Start event, it's used as it or to pipe it in head-full query creator
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
    success: createEvent<{ params: Params; data: MappedData }>(),
    failure: createEvent<{
      params: Params;
      error: Error | InvalidDataError | ContractError;
    }>(),
    skip: createEvent<{ params: Params }>(),
    finally: createEvent<{ params: Params }>(),
  };

  // -- Main stores --
  const $data = createStore<MappedData | null>(null, {
    sid: `ff.${queryName}.$data`,
    name: `${queryName}.$data`,
  });
  const $error = createStore<Error | InvalidDataError | ContractError | null>(
    null,
    { sid: 'ff.$error', name: `${queryName}.$error` }
  );
  const $status = createStore<FetchingStatus>('initial', {
    sid: `ff.${queryName}.$status`,
    name: `${queryName}.$status`,
  });
  const $stale = createStore<boolean>(false, {
    sid: `ff.${queryName}.$stale`,
    name: `${queryName}.$stale`,
  });
  const $enabled = normalizeStaticOrReactive(enabled ?? true).map(Boolean);

  // -- Execution --
  sample({ clock: start, filter: $enabled, target: executeFx });
  sample({
    clock: start,
    filter: not($enabled),
    fn(params) {
      return { params };
    },
    target: finished.skip,
  });

  sample({ clock: executeFx.done, target: applyContractFx });
  sample({ clock: executeFx.fail, target: finished.failure });

  sample({
    clock: applyContractFx.done,
    source: normalizeSourced(
      reduceTwoArgs({
        field: mapData,
        clock: {
          data: applyContractFx.doneData,
          // Extract original params, it is params of params
          params: applyContractFx.done.map(({ params }) => params.params),
        },
      })
    ),
    fn: (mappedData, { params }) => ({
      data: mappedData,
      // Extract original params, it is params of params
      params: params.params,
    }),
    target: finished.success,
  });
  sample({
    clock: applyContractFx.fail,
    fn: ({ error, params }) => ({
      error,
      // Extract original params, it is params of params
      params: params.params,
    }),
    target: finished.failure,
  });

  sample({ clock: finished.success, fn: () => null, target: $error });
  sample({ clock: finished.success, fn: ({ data }) => data, target: $data });

  sample({ clock: finished.failure, fn: () => null, target: $data });
  sample({ clock: finished.failure, fn: ({ error }) => error, target: $error });

  sample({
    clock: [finished.success, finished.failure, finished.skip],
    fn({ params }) {
      return { params };
    },
    target: finished.finally,
  });

  // -- Indicate status --
  sample({
    clock: [
      start.map(() => 'pending' as const),
      finished.success.map(() => 'done' as const),
      finished.failure.map(() => 'fail' as const),
    ],
    target: $status,
  });

  // -- Handle stale
  sample({
    clock: finished.finally,
    fn() {
      return false;
    },
    target: $stale,
  });

  // -- Derived stores --
  const $pending = $status.map((status) => status === 'pending');

  return {
    start,
    $data,
    $error,
    finished,
    $status,
    $pending,
    $enabled,
    $stale,
    __: { executeFx },
  };
}

export { createHeadlessQuery };
export type { SharedQueryFactoryConfig };
