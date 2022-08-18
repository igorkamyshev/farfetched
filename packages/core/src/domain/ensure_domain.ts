import { createEvent, Domain, Event } from 'effector';
import { Query } from '../query/type';

type AnyQuery = Query<any, any, any>;

const farfetchedMeta = Symbol('farfetchedMeta');

type EnsuredDomain = Domain & {
  graphite: {
    meta: {
      [farfetchedMeta]: {
        queries: { history: Set<AnyQuery>; createTrigger: Event<AnyQuery> };
      };
    };
  };
};

function ensureDomain(domain: Domain): EnsuredDomain {
  const ensuredDomain: EnsuredDomain = domain as any;

  if (!ensuredDomain.graphite.meta[farfetchedMeta]) {
    ensuredDomain.graphite.meta[farfetchedMeta] = {
      queries: { history: new Set(), createTrigger: createEvent<AnyQuery>() },
    };

    ensuredDomain.graphite.meta[farfetchedMeta].queries.createTrigger.watch(
      (query) => {
        ensuredDomain.graphite.meta[farfetchedMeta].queries.history.add(query);
      }
    );
  }

  return ensuredDomain;
}

export { ensureDomain, type AnyQuery, farfetchedMeta };
