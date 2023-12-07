import { configurationError } from '../errors/create_error';

let cancelCallback: (() => void) | null = null;

let cancelIsAllowed = false;

export function allowCancelSetting() {
  cancelIsAllowed = true;
}

export function disallowCancelSetting() {
  cancelIsAllowed = false;
}

/**
 * Binds a callback to be called when the Operation is aborted
 *
 * @param callback Callback to be called when the Operation is aborted
 */
export function onAbort(callback: () => void) {
  if (!cancelIsAllowed) {
    throw configurationError({
      reason: 'onAbort call is not allowed',
      validationErrors: [
        'onAbort can be called only in the context of a handler before any async operation is performed',
      ],
    });
  }

  if (cancelCallback) {
    throw configurationError({
      reason: 'onAbort call is not allowed',
      validationErrors: ['onAbort can be called only once per operation'],
    });
  }
  cancelCallback = callback;
}

export function occupyCurrentCancelCallback() {
  const toReturn = cancelCallback;

  cancelCallback = null;

  return toReturn;
}
