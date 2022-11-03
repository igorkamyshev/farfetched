import { Effect } from 'effector';

import {
  createHeadlessMutation,
  SharedMutationFactoryConfig,
} from './create_headless_mutation';
import { InvalidDataError } from '../errors/type';
import { Contract } from '../contract/type';
import { Mutation } from './type';
import { resolveExecuteEffect } from '../misc/execute_effect';
import { unknownContract } from '../contract/unknown_contract';
import { identity } from '../misc/identity';

// Overload: Only handler
function createMutation<Params, Data>(
  config: {
    handler: (params: Params) => Promise<Data>;
  } & SharedMutationFactoryConfig
): Mutation<Params, Data, unknown>;

// Overload: Only effect
function createMutation<Params, Data, Error>(
  config: {
    effect: Effect<Params, Data, Error>;
  } & SharedMutationFactoryConfig
): Mutation<Params, Data, Error>;

function createMutation<Params, Data, ContractData extends Data, Error>(
  config: {
    effect: Effect<Params, Data, Error>;
    contract: Contract<Data, ContractData>;
  } & SharedMutationFactoryConfig
): Mutation<Params, ContractData, Error | InvalidDataError>;

// -- Implementation --
function createMutation(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Mutation<any, any, any> {
  const mutation = createHeadlessMutation({
    name: config.name,
    enabled: config.enabled,
    contract: config.contract ?? unknownContract,
    mapData: identity,
    domain: config.domain,
  });

  mutation.__.executeFx.use(resolveExecuteEffect(config));

  return mutation;
}

export { createMutation };
