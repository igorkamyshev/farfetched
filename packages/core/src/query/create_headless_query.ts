import { createStore, sample, split, createEvent } from 'effector';
import { not, reset as resetMany } from 'patronum';

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
import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { serializationForSideStore } from '../serialization/serizalize_for_side_store';
import { Serialize } from '../serialization/type';
import { checkValidationResult } from '../validation/check_validation_result';
import { Validator } from '../validation/type';
import { unwrapValidationResult } from '../validation/unwrap_validation_result';
import { validValidator } from '../validation/valid_validator';
import { Query, QueryMeta, QuerySymbol } from './type';

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

  const operation = createRemoteOperation<
    Params,
    MappedData,
    Error | InvalidDataError,
    QueryMeta<MappedData>
  >({
    name: queryName,
    kind: QuerySymbol,
    serialize: serializationForSideStore(serialize),
    $enabled: normalizeStaticOrReactive(enabled ?? true).map(Boolean),
    meta: { serialize },
  });

  const applyContractFx = createContractApplier<Params, Response, ContractData>(
    contract
  );

  const reset = createEvent();

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
  const $stale = createStore<boolean>(false, {
    sid: `ff.${queryName}.$stale`,
    name: `${queryName}.$stale`,
    serialize: serializationForSideStore(serialize),
  });

  // -- Execution --
  sample({
    clock: operation.start,
    filter: operation.$enabled,
    target: operation.__.executeFx,
  });

  sample({ clock: operation.__.executeFx.done, target: applyContractFx });
  sample({
    clock: operation.__.executeFx.fail,
    target: operation.finished.failure,
  });

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
    target: operation.finished.success,
  });

  sample({
    clock: applyContractFx.fail,
    fn: ({ error, params }) => ({
      error,
      // Extract original params, it is params of params
      params: params.params,
    }),
    target: operation.finished.failure,
  });

  sample({
    clock: invalidDataRecieved,
    fn: ({ params, validation }) => ({
      params,
      error: invalidDataError({
        validationErrors: unwrapValidationResult(validation),
      }),
    }),
    target: operation.finished.failure,
  });

  sample({ clock: operation.finished.success, fn: () => null, target: $error });
  sample({
    clock: operation.finished.success,
    fn: ({ data }) => data,
    target: $data,
  });

  sample({ clock: operation.finished.failure, fn: () => null, target: $data });
  sample({
    clock: operation.finished.failure,
    fn: ({ error }) => error,
    target: $error,
  });

  // -- Handle stale
  sample({
    clock: operation.finished.finally,
    fn() {
      return false;
    },
    target: $stale,
  });

  // -- Reset state --

  resetMany({
    clock: reset,
    target: [$data, $error, $stale, operation.$status],
  });

  return {
    $data,
    $error,
    $stale,
    reset,
    ...operation,
  };
}

export { createHeadlessQuery };
export type { SharedQueryFactoryConfig, Serialize };
