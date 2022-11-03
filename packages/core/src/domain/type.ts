import { Domain } from 'effector';

import { Mutation } from '../mutation/type';
import { Query } from '../query/type';

export const internalDomainSymbol = Symbol('internalDomainSymbol');

export type InternalDomain = Domain & {
  [internalDomainSymbol]: {
    history: {
      queries: Array<Query<any, any, any>>;
      mutations: Array<Mutation<any, any, any>>;
    };
    registerQuery: (query: Query<any, any, any>) => void;
    registerMutation: (mutation: Mutation<any, any, any>) => void;
    onQueryCreated: (cb: (query: Query<any, any, any>) => void) => void;
    onMutationCreated: (
      cb: (mutation: Mutation<any, any, any>) => void
    ) => void;
  };
};
