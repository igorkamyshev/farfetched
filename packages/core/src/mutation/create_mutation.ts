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

// Overload: Only handler without config
export function createMutation<Params, Data>(handler: (params: Params) => Promise<Data>): Mutation<Params, Data, unknown>;

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
  const params = typeof config === 'function' ? { handler: config } : config;

  const mutation = createHeadlessMutation({
    name: params.name,
    enabled: params.enabled,
    contract: params.contract ?? unknownContract,
    mapData: ({ result }) => result,
  });

  mutation.__.executeFx.use(resolveExecuteEffect(params));

  return mutation;
}
