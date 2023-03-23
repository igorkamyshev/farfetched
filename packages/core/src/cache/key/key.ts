import { Query } from '../../query/type';
import { sha1 } from '../lib/hash';
import { stableStringify } from '../lib/stable_stringify';

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
    'Query does not have sid or uniq name, which is required for caching, read more https://farfetched.pages.dev/recipes/sids.html'
  );
}

function querySid(query: Query<any, any, any>): string | null {
  const sid = query.$data.sid;

  if (!sid?.includes('|')) {
    return null;
  }

  return sid;
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
