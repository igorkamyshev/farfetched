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

  /**
   * Workararound for Safari 14.0
   * @see https://github.com/igorkamyshev/farfetched/issues/528
   */
  const urlArgs = [urlString, urlBase].filter(Boolean) as [string, string];

  try {
    return new URL(...urlArgs);
  } catch (e) {
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
