import { Effect } from 'effector';

import {
  createHeadlessMutation,
  SharedMutationFactoryConfig,
} from './create_headless_mutation';
import { InvalidDataError } from '../errors/type';
import { Contract } from '../contract/type';
import { Mutation } from './type';
import { resolveExecuteEffect } from '../remote_operation/resolve_execute_effect';
import { unknownContract } from '../contract/unknown_contract';

// Overload: Only handler
export function createMutation<Params, Data>(
  config: {
    handler: (params: Params) => Promise<Data>;
  } & SharedMutationFactoryConfig
): Mutation<Params, Data, unknown>;

// Overload: Only effect
export function createMutation<Params, Data, Error>(
  config: {
    effect: Effect<Params, Data, Error>;
  } & SharedMutationFactoryConfig
): Mutation<Params, Data, Error>;

export function createMutation<Params, Data, ContractData extends Data, Error>(
  config: {
    effect: Effect<Params, Data, Error>;
    contract: Contract<Data, ContractData>;
  } & SharedMutationFactoryConfig
): Mutation<Params, ContractData, Error | InvalidDataError>;

// -- Implementation --
export function createMutation(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Mutation<any, any, any> {
  const mutation = createHeadlessMutation({
    name: config.name,
    enabled: config.enabled,
    contract: config.contract ?? unknownContract,
    mapData: ({ result }) => result,
  });

  mutation.__.executeFx.use(resolveExecuteEffect(config));

  return mutation;
}
