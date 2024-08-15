import { Query } from '../../query/type';
import { sha1 } from '../lib/hash';
import { stableStringify } from '../lib/stable_stringify';

export function createHumanReadbleKey({
  sid,
  params = null,
  sources,
}: {
  sid: string;
  params: unknown;
  sources: unknown[];
}): string | null {
  try {
    return stableStringify({ params, sources, sid }) ?? null;
  } catch (e: unknown) {
    return null;
  }
}

export function createKey({
  sid,
  params = null,
  sources,
}: {
  sid: string;
  params: unknown;
  sources: unknown[];
}): string | null {
  try {
    const stableString = stableStringify({ params, sources, sid })!;

    return sha1(stableString);
  } catch (e: unknown) {
    return null;
  }
}

export function queryUniqId(query: Query<any, any, any>) {
  const sid = querySid(query);

  if (sid) {
    return sid;
  }

  const uniqName = queryUniqName(query);

  if (uniqName) {
    return uniqName;
  }

  throw new Error(
    'Query does not have sid or uniq name, which is required for caching, read more https://effector.dev/en/explanation/sids/'
  );
}

function querySid(query: Query<any, any, any>): string | null {
  return query.__.meta.sid ?? null;
}

const prevNames = new Set<string>();
function queryUniqName(query: Query<any, any, any>): string | null {
  const name = query.__.meta.name;

  if (prevNames.has(name)) {
    return null;
  }

  prevNames.add(name);
  return name;
}
