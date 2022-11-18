import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import { DynamicallySourcedField, StaticOrReactive } from '../misc/sourced';
import { Mutation, MutationSymbol } from './type';
import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';

interface SharedMutationFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
}

function createHeadlessMutation<
  Params,
  Data,
  ContractData extends Data,
  MappedData,
  Error,
  MapDataSource = void,
  ValidationSource = void
>({
  name,
  enabled,
  contract,
  validate,
  mapData,
}: SharedMutationFactoryConfig & {
  contract: Contract<Data, ContractData>;
  validate?: Validator<ContractData, Params, ValidationSource>;
  mapData: DynamicallySourcedField<
    { result: ContractData; params: Params },
    MappedData,
    MapDataSource
  >;
}): Mutation<Params, MappedData, Error | InvalidDataError> {
  const mutationName = name ?? 'unnamed';

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
    name: mutationName,
    serialize: 'ignore',
    enabled,
    kind: MutationSymbol,
    meta: null,
    contract,
    validate,
    mapData,
  });

  return operation;
}

export { type SharedMutationFactoryConfig, createHeadlessMutation };
