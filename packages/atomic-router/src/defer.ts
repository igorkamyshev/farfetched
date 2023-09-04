/**
 * Copy-pasted, original author is https://github.com/AlexandrHoroshih
 */

export type Defer<Resolve = void, Reject = void> = {
  resolve(v: Resolve): void;
  reject(v?: Reject): void;
  promise: Promise<Resolve>;
};

/**
 * Creates defer - controlled promise
 */
export function createDefer<Resolve, Reject = unknown>() {
  const defer: Defer<Resolve, Reject> = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    resolve: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    reject: () => {},
    // @ts-expect-error it will be set later
    promise: null,
  };

  defer.promise = new Promise<Resolve>((rs, rj) => {
    defer.resolve = rs;
    defer.reject = rj;
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  defer.promise.catch(() => {});

  return defer;
}
