import { RemoteOperation } from '../remote_operation/type';

const MutationSymbol = Symbol('Mutation');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Mutation<Params, Data, Error>
  extends RemoteOperation<Params, Data, Error, null> {}

function isMutation(value: any): value is Mutation<any, any, any> {
  return value?.__?.kind === MutationSymbol;
}

export { type Mutation, isMutation, MutationSymbol };
