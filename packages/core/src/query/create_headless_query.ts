import {
  createEffect,
  createEvent,
  createStore,
  Domain,
  sample,
} from 'effector';
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
import { triggerQuery } from '../domain/query_domain';
import { FetchingStatus } from '../status/type';
import { Query } from './type';
import { createQueryNode } from '../node/query_node';

interface SharedQueryFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
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
  ContractError extends Response,
  MappedData,
  MapDataSource
>({
  contract,
  mapData,
  enabled,
  name,
  domain,
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

  const applyContractFx = createContractApplier(contract);

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
  const done = {
    success: createEvent<MappedData>(),
    error: createEvent<Error | InvalidDataError | ContractError>(),
    skip: createEvent(),
    finally: createEvent(),
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
    fn() {
      // pass
    },
    target: done.skip,
  });

  sample({ clock: executeFx.doneData, target: applyContractFx });
  sample({ clock: executeFx.failData, target: done.error });

  sample({
    clock: applyContractFx.doneData,
    source: normalizeSourced(
      reduceTwoArgs({
        field: mapData,
        clock: {
          data: applyContractFx.doneData,
          params: start,
        },
      })
    ),
    target: done.success,
  });
  sample({ clock: applyContractFx.failData, target: done.error });

  sample({ clock: done.success, fn: () => null, target: $error });
  sample({ clock: done.success, target: $data });

  sample({ clock: done.error, fn: () => null, target: $data });
  sample({ clock: done.error, target: $error });

  sample({
    clock: [done.success, done.error, done.skip],
    fn() {
      // do not pass any payload to done.finally
    },
    target: done.finally,
  });

  // -- Indicate status --
  sample({
    clock: [
      start.map(() => 'pending' as const),
      done.success.map(() => 'done' as const),
      done.error.map(() => 'fail' as const),
    ],
    target: $status,
  });

  // -- Handle stale
  sample({
    clock: done.finally,
    fn() {
      return false;
    },
    target: $stale,
  });

  // -- Derived stores --
  const $pending = $status.map((status) => status === 'pending');

  // -- Meta information --

  const node = createQueryNode({ name: queryName });

  // -- Final Query --
  const query = {
    start,
    $data,
    $error,
    done,
    $status,
    $pending,
    $enabled,
    $stale,
    __: { executeFx, node },
  };

  // -- Domain connection --
  if (domain) {
    triggerQuery({ query, domain });
  }

  return query;
}

export { createHeadlessQuery };
export type { SharedQueryFactoryConfig };
