export function zipObject<
  ExternalKeys extends string,
  InternalKeys extends string
>(
  object: Record<ExternalKeys, Record<InternalKeys, unknown>>
): Record<InternalKeys, Record<ExternalKeys, unknown>> {
  const result: any = {};

  for (const [key, value] of Object.entries(object)) {
    for (const [k, v] of Object.entries(value as any)) {
      result[k] = { ...result[k], [key]: v };
    }
  }

  return result;
}
