import { RemoteOperation } from '../remote_operation/type';

export const MutationSymbol = Symbol('Mutation');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Mutation<Params, Data, Error>
  extends RemoteOperation<Params, Data, Error, null> {}

export function isMutation(value: any): value is Mutation<any, any, any> {
  return value?.__?.kind === MutationSymbol;
}
