import { attach, type Store } from 'effector';

import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import {
  type DynamicallySourcedField,
  readonly,
  type StaticOrReactive,
} from '../libs/patronus';
import { type Mutation, MutationSymbol } from './type';
import { type Contract } from '../contract/type';
import { type InvalidDataError } from '../errors/type';
import { type Validator } from '../validation/type';

export interface SharedMutationFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
}

export function createHeadlessMutation<
  Params,
  Data,
  ContractData extends Data,
  MappedData,
  Error,
  MapDataSource = void,
  ValidationSource = void
>(
  config: SharedMutationFactoryConfig & {
    contract: Contract<Data, ContractData>;
    validate?: Validator<ContractData, Params, ValidationSource>;
    mapData: DynamicallySourcedField<
      { result: ContractData; params: Params },
      MappedData,
      MapDataSource
    >;
  }
): Mutation<Params, MappedData, Error | InvalidDataError> {
  const { name, enabled, contract, validate, mapData } = config;

  const operation = createRemoteOperation<
    Params,
    Data,
    ContractData,
    MappedData,
    Error,
    null,
    MapDataSource,
    ValidationSource
  >({
    name,
    serialize: 'ignore',
    enabled,
    kind: MutationSymbol,
    meta: null,
    contract,
    validate,
    mapData,
  });

  // -- Protocols --

  const unitShape = {
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
    const attachedMutation = createHeadlessMutation<
      NewParams,
      Data,
      ContractData,
      MappedData,
      unknown,
      MapDataSource,
      ValidationSource
    >(config as any);

    attachedMutation.__.lowLevelAPI.dataSourceRetrieverFx.use(
      attach({
        source,
        mapParams: (
          { params, ...rest }: { params: NewParams },
          sourceValue
        ): { params: Params } => ({
          params: (mapParams
            ? mapParams(params, sourceValue)
            : params) as Params,
          ...rest,
        }),
        effect: operation.__.lowLevelAPI.dataSourceRetrieverFx,
      })
    );

    return attachedMutation;
  };

  // -- Public API --

  return {
    start: operation.start,
    $status: readonly(operation.$status),
    $idle: readonly(operation.$idle),
    $pending: readonly(operation.$pending),
    $succeeded: readonly(operation.$succeeded),
    $failed: readonly(operation.$failed),
    $enabled: readonly(operation.$enabled),
    finished: {
      success: readonly(operation.finished.success),
      failure: readonly(operation.finished.failure),
      finally: readonly(operation.finished.finally),
      skip: readonly(operation.finished.skip),
    },
    __: { ...operation.__, experimentalAPI: { attach: attachProtocol } },
    '@@unitShape': unitShapeProtocol,
  };
}
