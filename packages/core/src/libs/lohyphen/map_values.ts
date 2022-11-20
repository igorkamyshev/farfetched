export function mapValues<
  I extends Record<string, any>,
  O extends Record<string, any>
>(val: I, fn: (val: I[keyof I]) => O[keyof O]): O {
  const mappedEntries = Object.entries(val).map(
    ([key, value]) => [key, fn(value)] as const
  );

  return Object.fromEntries(mappedEntries) as O;
}
