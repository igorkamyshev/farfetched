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

export function formatUrl(url: string, queryRecord: FetchApiRecord): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(queryRecord)) {
    const cleanValue = clearValue(value);
    if (Array.isArray(cleanValue)) {
      for (const v of cleanValue) {
        query.append(key, v);
      }
    } else {
      query.append(key, cleanValue);
    }
  }
  const queryString = query.toString();

  if (!queryString) {
    return url;
  }

  return `${url}?${queryString}`;
}

function clearValue(value: string | string[] | number): string | string[] {
  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
}
