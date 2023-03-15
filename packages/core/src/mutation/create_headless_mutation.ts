import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { DynamicallySourcedField, StaticOrReactive } from '../libs/patronus';
import { Mutation, MutationSymbol } from './type';
import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';
import { attach, Store } from 'effector';

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

    const newSources = operation.__.lowLevelAPI.dataSources.map(
      (dataSource) => ({
        // ...dataSource,
        get: attach({ source, mapParams, effect: dataSource.get }),
      })
    );

    attachedMutation.__.lowLevelAPI.dataSources.splice(
      0,
      newSources.length,
      ...newSources
    );

    attachedMutation.__.lowLevelAPI.dataSourceRetrieverFx.use(
      attach({
        source,
        mapParams,
        effect: operation.__.lowLevelAPI.dataSourceRetrieverFx,
      })
    );

    return attachedMutation;
  };

  // -- Public API --

  return {
    ...operation,
    __: { ...operation.__, experimentalAPI: { attach: attachProtocol } },
    '@@unitShape': unitShapeProtocol,
  };
}
