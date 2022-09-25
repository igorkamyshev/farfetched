import { Mutation } from './type';

// Overload: Only handler
function createMutation<Params, Data>(config: {
  handler: (params: Params) => Promise<Data>;
}): Mutation<Params, Data, unknown>;

// -- Implementation --
function createMutation(
  // Use any because of overloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): Mutation<any, any, any> {
  return {} as any;
}

export { createMutation };
