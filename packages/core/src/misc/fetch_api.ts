type FetchApiRecord = Record<string, string | string[]>;

function mergeRecords(
  ...records: (FetchApiRecord | undefined | null)[]
): FetchApiRecord {
  const final: FetchApiRecord = {};

  for (const item of records) {
    for (const [key, value] of Object.entries(item || {})) {
      if (final[key]) {
        final[key] = [final[key], value].flat();
      } else {
        final[key] = value;
      }
    }
  }

  return final;
}

function formatHeaders(headersRecord: FetchApiRecord): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(headersRecord)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else {
      headers.append(key, value);
    }
  }

  return headers;
}

function formatUrl(url: string, queryRecord: FetchApiRecord): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(queryRecord)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        query.append(key, v);
      }
    } else {
      query.append(key, value);
    }
  }
  const queryString = query.toString();

  if (!queryString) {
    return url;
  }

  return `${url}?${queryString}`;
}

export { formatUrl, formatHeaders, mergeRecords, type FetchApiRecord };
