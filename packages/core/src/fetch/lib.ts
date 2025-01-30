import { configurationError } from '../errors/create_error';

export type FetchApiRecord = Record<
  string,
  string | string[] | number | boolean | null | undefined
>;

export function mergeRecords(
  ...records: (FetchApiRecord | undefined | null)[]
): FetchApiRecord {
  const final: Record<string, string | string[]> = {};

  for (const item of records) {
    if (typeof item !== 'object') {
      continue;
    }
    for (const [key, value] of Object.entries(item || {})) {
      const newCleanValue = clearValue(value);
      if (newCleanValue === null) {
        continue;
      }
      if (final[key]) {
        final[key] = [final[key], newCleanValue].flat();
      } else {
        final[key] = newCleanValue;
      }
    }
  }

  return final;
}

export function mergeQueryStrings(
  ...queryStrings: (FetchApiRecord | string | undefined | null)[]
): string {
  const final: string[] = [];

  for (const item of queryStrings) {
    if (!item) {
      continue;
    }

    let curr: string;
    if (typeof item !== 'string') {
      curr = recordToUrlSearchParams(item).toString();
    } else {
      curr = item;
    }
    final.push(curr);
  }

  return final.join('&');
}

export function formatHeaders(headersRecord: FetchApiRecord): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(headersRecord)) {
    const cleanValue = clearValue(value);

    if (Array.isArray(cleanValue)) {
      for (const v of cleanValue) {
        headers.append(key, v);
      }
    } else if (cleanValue !== null) {
      headers.append(key, cleanValue);
    }
  }

  return headers;
}

export function formatUrl(
  url: string,
  queryRecord: FetchApiRecord | string
): URL {
  let urlBase: string | undefined;
  if (url.startsWith('/')) {
    urlBase = window.location.origin;
  }

  let urlString: string;
  let queryString: string;

  if (typeof queryRecord === 'string') {
    queryString = queryRecord;
  } else {
    queryString = recordToUrlSearchParams(queryRecord).toString();
  }

  if (!queryString) {
    urlString = url;
  } else {
    urlString = `${url}?${queryString}`;
  }

  try {
    return new URL(urlString, urlBase);
  } catch (e) {
    if (!urlBase) {
      try {
        /**
         * Fallback branch for Safari 14.0
         * @see https://github.com/igorkamyshev/farfetched/issues/528
         *
         * If url is full path, but we're in Safari 14.0, we will have a TypeError for new URL(urlString, undefined)
         *
         * So we have to manually split url into base and path parts first
         */
        const { base, path } = splitUrl(urlString);

        return new URL(path, base);
      } catch (_e) {
        throw configurationError({
          reason: 'Invalid URL',
          validationErrors: [`"${urlString}" is not valid URL`],
        });
      }
    }

    throw configurationError({
      reason: 'Invalid URL',
      validationErrors: [`"${urlString}" is not valid URL`],
    });
  }
}

function recordToUrlSearchParams(record: FetchApiRecord): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(record)) {
    const cleanValue = clearValue(value);
    if (Array.isArray(cleanValue)) {
      for (const v of cleanValue) {
        params.append(key, v);
      }
    } else if (cleanValue !== null) {
      params.append(key, cleanValue);
    }
  }

  return params;
}

function clearValue(
  value: string | string[] | number | boolean | null | undefined
): string | string[] | null {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  return value ?? null;
}

/**
 *  @see https://github.com/igorkamyshev/farfetched/issues/528
 */
export function splitUrl(urlString: string): { base: string; path: string } {
  const urlPattern = /^(https?:\/\/[^\/]+)(\/.*)?$/;
  const match = urlString.match(urlPattern);

  if (!match) {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  const base = match[1];
  const path = match[2] || '';
  return { base, path };
}
