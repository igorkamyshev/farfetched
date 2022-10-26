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
import { ExecutionMeta } from '../misc/execution';
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
  let withInterruption = false;
  const registerInterruption = () => {
    withInterruption = true;
  };

  const fillData = createEvent<{
    params: Params;
    result: any;
    meta: ExecutionMeta;
  }>();

  const resumeExecution = createEvent<{ params: Params }>();

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
    success: createEvent<{
      params: Params;
      data: MappedData;
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
      return {
        params,
        meta: { stopErrorPropagation: false, isFreshData: true },
      };
    },
    target: finished.skip,
  });

  sample({
    clock: start,
    source: { enabled: $enabled },
    filter: ({ enabled }) => enabled && !withInterruption,
    fn: (_, params) => params,
    target: executeFx,
  });

  sample({
    clock: resumeExecution,
    fn: ({ params }) => params,
    target: executeFx,
  });

  sample({
    clock: executeFx.done,
    fn: ({ params, result }) => ({
      params,
      result,
      meta: { stopErrorPropagation: false, isFreshData: true },
    }),
    target: fillData,
  });

  sample({ clock: fillData, target: applyContractFx });
  sample({
    clock: executeFx.fail,
    fn: ({ error, params }) => ({
      error,
      params,
      meta: { stopErrorPropagation: false, isFreshData: true },
    }),
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
        meta: params.meta,
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
    fn: (data, { params, meta }) => ({
      data,
      params,
      meta,
    }),
    target: finished.success,
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
    fn: ({ params, validation, meta }) => ({
      params,
      error: invalidDataError({
        validationErrors: unwrapValidationResult(validation),
      }),
      meta,
    }),
    target: finished.failure,
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
    $pending,
    $failed,
    $succeeded,
    $enabled,
    __: {
      executeFx,
      meta,
      kind,
      sources: sources ?? [],
      cmd: { registerInterruption, fillData, resumeExecution },
    },
  };
}

export { createRemoteOperation };
