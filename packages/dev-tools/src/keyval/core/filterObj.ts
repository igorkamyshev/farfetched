export function filterObj<K extends string | number, V, VV extends V>(
  obj: Record<K, V>,
  fn: ((value: V, key: K) => value is VV) | ((value: V, key: K) => boolean)
): Record<K, VV> {
  return Object.fromEntries(
    Object.entries<V>(obj).filter(([key, value]) => fn(value, key as K))
  ) as Record<K, VV>;
}
