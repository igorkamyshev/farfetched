/** comparison with sorting taken into account */
export function areArraysDifferent<T>(a: T[], b: T[]) {
  if (a === b) return false;
  return a.length !== b.length || a.some((e, idx) => e !== b[idx]);
}

export function areObjectsDifferent<K extends number | string, V>(
  a: Record<K, V>,
  b: Record<K, V>
) {
  if (a === b) return false;

  const aKeys = Object.keys(a) as K[];
  const bKeys = Object.keys(b) as K[];

  if (aKeys.length !== bKeys.length) {
    return true;
  }

  return aKeys.some((aKey) => a[aKey] !== b[aKey]);
}
