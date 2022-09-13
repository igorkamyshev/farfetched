import {
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
} from 'effector';
import { not } from 'patronum';

import { createContractApplier } from '../contract/apply_contract';
import { Contract } from '../contract/type';
import { invalidDataError } from '../errors/create_error';
import { InvalidDataError } from '../errors/type';
import {
  normalizeSourced,
  TwoArgsDynamicallySourcedField,
  reduceTwoArgs,
  StaticOrReactive,
  normalizeStaticOrReactive,
} from '../misc/sourced';
import { serializationForSideStore } from '../serialization/serizalize_for_side_store';
import { Serialize } from '../serialization/type';
import { FetchingStatus } from '../status/type';
import { checkValidationResult } from '../validation/check_validation_result';
import { Validator } from '../validation/type';
import { unwrapValidationResult } from '../validation/unwrap_validation_result';
import { validValidator } from '../validation/valid_validator';
import { Query, QuerySymbol } from './type';

interface SharedQueryFactoryConfig<Data> {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
  serialize?: Serialize<Data>;
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
  ValidationSource
>({
  contract,
  mapData,
  enabled,
  validate,
  name,
  serialize,
}: {
  contract: Contract<Response, ContractData>;
  mapData: TwoArgsDynamicallySourcedField<
    ContractData,
    Params,
    MappedData,
    MapDataSource
  >;
  validate?: Validator<ContractData, Params, ValidationSource>;
} & SharedQueryFactoryConfig<MappedData>): Query<
  Params,
  MappedData,
  Error | InvalidDataError
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

  const applyContractFx = createContractApplier<Params, Response, ContractData>(
    contract
  );

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
      error: Error | InvalidDataError;
    }>(),
    skip: createEvent<{ params: Params }>(),
    finally: createEvent<{ params: Params }>(),
  };

  // -- Main stores --
  const $data = createStore<MappedData | null>(null, {
    sid: `ff.${queryName}.$data`,
    name: `${queryName}.$data`,
    serialize,
  });
  const $error = createStore<Error | InvalidDataError | null>(null, {
    sid: `ff.${queryName}.$error`,
    name: `${queryName}.$error`,
    serialize: serializationForSideStore(serialize),
  });
  const $status = createStore<FetchingStatus>('initial', {
    sid: `ff.${queryName}.$status`,
    name: `${queryName}.$status`,
    serialize: serializationForSideStore(serialize),
  });
  const $stale = createStore<boolean>(false, {
    sid: `ff.${queryName}.$stale`,
    name: `${queryName}.$stale`,
    serialize: serializationForSideStore(serialize),
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

  const { validDataRecieved, __: invalidDataRecieved } = split(
    sample({
      clock: applyContractFx.done,
      source: normalizeSourced(
        reduceTwoArgs({
          field: validate ?? validValidator,
          clock: applyContractFx.done.map(({ result, params }) => [
            result,
            params.params, // Extract original params, it is params of params
          ]),
        })
      ),
      fn: (validation, { params, result: data }) => ({
        data,
        // Extract original params, it is params of params
        params: params.params,
        validation,
      }),
    }),
    {
      validDataRecieved: ({ validation }) => checkValidationResult(validation),
    }
  );

  sample({
    clock: validDataRecieved,
    source: normalizeSourced(
      reduceTwoArgs({
        field: mapData,
        clock: validDataRecieved.map(({ data, params }) => [data, params]),
      })
    ),
    fn: (data, { params }) => ({
      data,
      params,
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

  sample({
    clock: invalidDataRecieved,
    fn: ({ params, validation }) => ({
      params,
      error: invalidDataError({
        validationErrors: unwrapValidationResult(validation),
      }),
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
    __: { executeFx, meta: { serialize }, query: QuerySymbol },
  };
}

export { createHeadlessQuery };
export type { SharedQueryFactoryConfig, Serialize };
