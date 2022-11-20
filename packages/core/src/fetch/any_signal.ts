/* eslint-disable no-continue */

/**
 * Inlined library
 * https://github.com/jacobheun/any-signal
 */
export function anySignal(
  ...signals: Array<AbortSignal | null | undefined>
): AbortSignal {
  const controller = new AbortController();

  function onAbort() {
    controller.abort();

    for (const signal of signals) {
      if (!signal || !signal.removeEventListener) continue;
      signal.removeEventListener('abort', onAbort);
    }
  }

  for (const signal of signals) {
    if (!signal || !signal.addEventListener) continue;
    if (signal.aborted) {
      onAbort();
      break;
    }
    signal.addEventListener('abort', onAbort);
  }

  return controller.signal;
}
