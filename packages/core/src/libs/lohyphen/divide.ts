export function divide<T, P>(
  items: Array<T | P>,
  predicate: (item: T | P) => item is T
): [Array<T>, Array<P extends T ? never : P>] {
  const left = [];
  const right = [];

  for (const item of items) {
    if (predicate(item)) {
      left.push(item);
    } else {
      right.push(item as any);
    }
  }

  return [left, right];
}
