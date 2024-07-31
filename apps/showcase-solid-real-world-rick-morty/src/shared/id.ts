export function urlToId(url: string): number {
  return parseInt(url.split('/').at(-1) ?? '', 10);
}
