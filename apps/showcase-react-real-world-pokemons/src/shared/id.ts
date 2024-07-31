export function urlToId(url: string): string {
  return parseInt(url.split('/').filter(Boolean).at(-1) ?? '', 10) as TId;
}
