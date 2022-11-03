import { Domain } from 'effector';

import { internalDomainSymbol, InternalDomain } from './type';

export function toInternalDomain(domain: Domain): InternalDomain {
  if (!(internalDomainSymbol in domain)) {
    const history: InternalDomain[typeof internalDomainSymbol]['history'] = {
      queries: [],
      mutations: [],
    };

    const onCreateQuery: Array<(query: any) => void> = [];
    const onCreateMutation: Array<(mutation: any) => void> = [];

    const internal: InternalDomain[typeof internalDomainSymbol] = {
      history,
      registerMutation: (mutation) => {
        history.mutations.push(mutation);
        for (const cb of onCreateMutation) {
          cb(mutation);
        }
      },
      registerQuery: (query) => {
        history.queries.push(query);
        for (const cb of onCreateQuery) {
          cb(query);
        }
      },
      onMutationCreated: (cb) => {
        onCreateMutation.push(cb);
        for (const mutation of history.mutations) {
          cb(mutation);
        }
      },
      onQueryCreated: (cb) => {
        onCreateQuery.push(cb);
        for (const query of history.queries) {
          cb(query);
        }
      },
    };

    (domain as any)[internalDomainSymbol] = internal;
  }

  return domain as InternalDomain;
}
