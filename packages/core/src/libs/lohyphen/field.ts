export function get<T extends Record<string, any>, P extends keyof T>(
  path: P
): (obj: T) => T[P] {
  return (obj) => obj[path];
}
