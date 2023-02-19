export type FetchApiRecord = Record<string, string | string[] | number>;

export function mergeRecords(
  ...records: (FetchApiRecord | undefined | null)[]
): FetchApiRecord {
  const final: Record<string, string | string[]> = {};

  for (const item of records) {
    if (typeof item !== 'object') {
      continue;
    }
    for (const [key, value] of Object.entries(item || {})) {
      if (final[key]) {
        final[key] = [final[key], clearValue(value)].flat();
      } else {
        final[key] = clearValue(value);
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
    } else {
      headers.append(key, cleanValue);
    }
  }

  return headers;
}

export function formatUrl(
  url: string,
  queryRecord: FetchApiRecord | string
): string {
  let queryString: string;

  if (typeof queryRecord === 'string') {
    queryString = queryRecord;
  } else {
    queryString = recordToUrlSearchParams(queryRecord).toString();
  }

  if (!queryString) {
    return url;
  }

  return `${url}?${queryString}`;
}

function recordToUrlSearchParams(record: FetchApiRecord): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(record)) {
    const cleanValue = clearValue(value);
    if (Array.isArray(cleanValue)) {
      for (const v of cleanValue) {
        params.append(key, v);
      }
    } else {
      params.append(key, cleanValue);
    }
  }

  return params;
}

function clearValue(value: string | string[] | number): string | string[] {
  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
}
