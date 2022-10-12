import {
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
  Store,
} from 'effector';
import { not } from 'patronum';
import { createContractApplier } from '../contract/apply_contract';
import { Contract } from '../contract/type';
import { invalidDataError } from '../errors/create_error';
import { InvalidDataError } from '../errors/type';
import {
  normalizeSourced,
  normalizeStaticOrReactive,
  reduceTwoArgs,
  StaticOrReactive,
  TwoArgsDynamicallySourcedField,
} from '../misc/sourced';
import { FetchingStatus } from '../status/type';
import { checkValidationResult } from '../validation/check_validation_result';
import { Validator } from '../validation/type';
import { unwrapValidationResult } from '../validation/unwrap_validation_result';
import { validValidator } from '../validation/valid_validator';
import { RemoteOperation } from './type';

function createRemoteOperation<
  Params,
  Data,
  ContractData extends Data,
  MappedData,
  Error,
  Meta,
  MapDataSource = void,
  ValidationSource = void
>({
  name,
  meta,
  kind,
  serialize,
  enabled,
  contract,
  validate,
  mapData,
  sources,
}: {
  name: string;
  meta: Meta;
  kind: unknown;
  serialize?: 'ignore';
  enabled?: StaticOrReactive<boolean>;
  contract: Contract<Data, ContractData>;
  validate?: Validator<ContractData, Params, ValidationSource>;
  mapData: TwoArgsDynamicallySourcedField<
    ContractData,
    Params,
    MappedData,
    MapDataSource
  >;
  sources?: Array<Store<unknown>>;
}): RemoteOperation<Params, MappedData, Error | InvalidDataError, Meta> {
  const applyContractFx = createContractApplier<Params, Data, ContractData>(
    contract
  );

  // Dummy effect, it will be replaced with real in head-full factory
  const executeFx = createEffect<any, any, any>({
    handler: () => {
      throw new Error('Not implemented');
    },
    sid: `ff.${name}.executeFx`,
    name: `${name}.executeFx`,
  });

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
    success: createEvent<{ params: Params; data: MappedData }>(),
    failure: createEvent<{ params: Params; error: Error | InvalidDataError }>(),
    skip: createEvent<{ params: Params }>(),
    finally: createEvent<{ params: Params }>(),
  };

  // -- Main stores --
  const $status = createStore<FetchingStatus>('initial', {
    sid: `ff.${name}.$status`,
    name: `${name}.$status`,
    serialize,
  });

  const $enabled = normalizeStaticOrReactive(enabled ?? true).map(Boolean);

  // -- Derived stores --
  const $pending = $status.map((status) => status === 'pending');
  const $failed = $status.map((status) => status === 'fail');
  const $succeeded = $status.map((status) => status === 'done');

  // -- Indicate status --
  sample({
    clock: [
      executeFx.map(() => 'pending' as const),
      finished.success.map(() => 'done' as const),
      finished.failure.map(() => 'fail' as const),
    ],
    target: $status,
  });

  // -- Execution flow
  sample({
    clock: start,
    filter: not($enabled),
    fn(params) {
      return { params };
    },
    target: finished.skip,
  });

  sample({
    clock: start,
    filter: $enabled,
    target: executeFx,
  });

  sample({ clock: executeFx.done, target: applyContractFx });
  sample({
    clock: executeFx.fail,
    target: finished.failure,
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

  // -- Send finally --
  sample({
    clock: [finished.success, finished.failure, finished.skip],
    fn({ params }) {
      return { params };
    },
    target: finished.finally,
  });

  return {
    start,
    finished,
    $status,
    $pending,
    $failed,
    $succeeded,
    $enabled,
    __: { executeFx, meta, kind, sources: sources ?? [] },
  };
}

export { createRemoteOperation };
