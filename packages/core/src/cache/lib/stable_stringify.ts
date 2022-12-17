export function stableStringify(data: unknown): string | void {
  const seen = new Set<unknown>();

  function stringify(node: unknown): string | void {
    if (node === undefined) return;
    if (node === null) return 'null';

    if (typeof node === 'number') {
      return isFinite(node) ? `${node}` : 'null';
    }

    if (typeof node === 'function') {
      throw new TypeError(`Can't serialize function`);
    }

    if (typeof node !== 'object') return JSON.stringify(node);

    if (seen.has(node)) {
      throw new TypeError(`Can't serialize cyclic structure`);
    }

    seen.add(node);

    if (Array.isArray(node)) {
      const values = node.map((v) => stringify(v) || 'null').join(',');

      seen.delete(node);

      return `[${values}]`;
    }

    const values = Object.keys(node)
      .sort()
      .map((key) => {
        // @ts-expect-error We're working with unknown object
        const value = stringify(node[key]);

        return value ? `${stringify(key)}:${value}` : '';
      })
      .filter(Boolean)
      .join(',');

    seen.delete(node);

    return `{${values}}`;
  }

  return stringify(data);
}
