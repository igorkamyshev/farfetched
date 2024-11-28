export const Meta = Symbol('Meta');
export const Result = Symbol('Result');

export function hasMeta(
  val: unknown
): val is { [Meta]: Record<string, unknown>; [Result]: unknown } {
  return (
    typeof val === 'object' && val !== null && Meta in val && Result in val
  );
}
