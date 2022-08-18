import { Domain, launch } from 'effector';

import { AnyQuery, ensureDomain, farfetchedMeta } from './ensure_domain';

function triggerQuery({ query, domain }: { query: AnyQuery; domain: Domain }) {
  const correctDomain = ensureDomain(domain);

  launch(
    correctDomain.graphite.meta[farfetchedMeta].queries.createTrigger,
    query
  );
}

function onQueryCreated({
  domain,
  fn,
}: {
  domain: Domain;
  fn: (query: AnyQuery) => void;
}) {
  const correctDomain = ensureDomain(domain);

  return correctDomain.graphite.meta[
    farfetchedMeta
  ].queries.createTrigger.watch(fn);
}

function allQueries({ domain }: { domain: Domain }): Array<AnyQuery> {
  const correctDomain = ensureDomain(domain);

  return Array.from(
    correctDomain.graphite.meta[farfetchedMeta].queries.history
  );
}

export { triggerQuery, onQueryCreated, allQueries };
