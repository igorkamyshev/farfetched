import { Effect } from 'effector';

import { SharedMutationFactoryConfig } from './create_headless_mutation';
import { Mutation } from './type';

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

// -- Implementation --
function createMutation(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Mutation<any, any, any> {
  return {} as any;
}

export { createMutation };
