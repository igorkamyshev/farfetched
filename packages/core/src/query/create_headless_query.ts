import { createEffect, createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';

import { createContractApplier } from '../contract/apply_contract';
import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import { mergeOptionalConfig, OptionalConfig } from '../misc/sid';
import {
  normalizeSourced,
  TwoArgsSourcedField,
  reduceTwoArgs,
  StaticOrReactive,
  normalizeStaticOrReactive,
} from '../misc/sourced';
import { FetchingStatus } from '../status/type';
import { Query } from './type';

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
>(
  {
    contract,
    mapData,
    enabled,
  }: {
    contract: Contract<Response, ContractData, ContractError>;
    mapData: TwoArgsSourcedField<
      ContractData,
      Params,
      MappedData,
      MapDataSource
    >;
    enabled?: StaticOrReactive<boolean>;
  },
  config?: OptionalConfig
): Query<Params, MappedData, Error | InvalidDataError | ContractError> {
  // Dummy effect, it will be replaced with real in head-full query creator
  const executeFx = createEffect<Params, Response, Error>({
    handler: () => {
      throw new Error('Not implemented');
    },
    ...mergeOptionalConfig({ sid: 'e', name: 'executeFx' }, config),
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
  const $data = createStore<MappedData | null>(
    null,
    mergeOptionalConfig({ sid: 'd', name: '$data' }, config)
  );
  const $error = createStore<Error | InvalidDataError | ContractError | null>(
    null,
    mergeOptionalConfig({ sid: 'e', name: '$error' }, config)
  );
  const $status = createStore<FetchingStatus>(
    'initial',
    mergeOptionalConfig({ sid: 's', name: '$status' }, config)
  );
  const $stale = createStore<boolean>(
    false,
    mergeOptionalConfig({ sid: 's', name: '$stale' }, config)
  );
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

  return {
    start,
    $data,
    $error,
    done,
    $status,
    $pending,
    $enabled,
    $stale,
    __: { executeFx },
  };
}

export { createHeadlessQuery };
