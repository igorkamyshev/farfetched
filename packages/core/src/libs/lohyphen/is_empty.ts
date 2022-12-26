export function isEmpty<T>(v: T | undefined): v is undefined {
  return v == undefined;
}

export function isNotEmpty<T>(v: T | undefined): v is T {
  return !isEmpty(v);
}
