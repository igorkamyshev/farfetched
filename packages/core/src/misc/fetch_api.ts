function mergeHeaders(
  ...headersLists: (HeadersInit | undefined | null)[]
): Record<string, string> {
  const final: Record<string, string> = {};

  for (const item of headersLists) {
    for (const [key, value] of Object.entries(item || {})) {
      final[key] = [final[key], value].filter(Boolean).join(', ');
    }
  }

  return final;
}

function mergeQuery(
  ...queries: (URLSearchParams | undefined | null)[]
): URLSearchParams {
  const final = new URLSearchParams();

  for (const item of queries) {
    item?.forEach((value, key) => final.append(key, value));
  }

  return final;
}

function formatUrl(url: string, query: URLSearchParams): string {
  const queryString = query.toString();

  if (!queryString) {
    return url;
  }

  return `${url}?${queryString}`;
}

export { formatUrl, mergeHeaders, mergeQuery };
