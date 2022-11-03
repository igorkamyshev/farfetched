import { Domain } from 'effector';

import { createRemoteOperation } from '../remote_operation/create_remote_operation';
import {
  StaticOrReactive,
  TwoArgsDynamicallySourcedField,
} from '../misc/sourced';
import { Mutation, MutationSymbol } from './type';
import { Contract } from '../contract/type';
import { InvalidDataError } from '../errors/type';
import { Validator } from '../validation/type';
import { toInternalDomain } from '../domain/guard_domain';
import { internalDomainSymbol } from '../domain/type';

interface SharedMutationFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
  domain?: Domain;
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
  domain,
}: SharedMutationFactoryConfig & {
  contract: Contract<Data, ContractData>;
  validate?: Validator<ContractData, Params, ValidationSource>;
  mapData: TwoArgsDynamicallySourcedField<
    ContractData,
    Params,
    MappedData,
    MapDataSource
  >;
}): Mutation<Params, MappedData, Error | InvalidDataError> {
  const mutationName = name ?? 'unnamed';

  const mutation = createRemoteOperation<
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

  if (domain) {
    toInternalDomain(domain)[internalDomainSymbol].registerMutation(mutation);
  }

  return mutation;
}

export { type SharedMutationFactoryConfig, createHeadlessMutation };
