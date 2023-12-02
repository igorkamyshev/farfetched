import { createWatch, type Event, type Scope } from 'effector';
import { vi } from 'vitest';

interface RemoteOperationLike {
  started: Event<any>;
  finished: {
    success: Event<any>;
    failure: Event<any>;
    skip: Event<any>;
    finally: Event<any>;
  };
}

export function watchRemoteOperation(op: RemoteOperationLike, scope: Scope) {
  const onStart = vi.fn();

  const onSuccess = vi.fn();
  const onSkip = vi.fn();
  const onFailure = vi.fn();
  const onFinally = vi.fn();

  const startUnwatch = createWatch({
    unit: op.started,
    fn: ({ params }) => onStart(params),
    scope,
  });

  const doneUnwatch = createWatch({
    unit: op.finished.success,
    fn: onSuccess,
    scope,
  });
  const skipUnwatch = createWatch({
    unit: op.finished.skip,
    fn: onSkip,
    scope,
  });
  const errorUnwatch = createWatch({
    unit: op.finished.failure,
    fn: onFailure,
    scope,
  });
  const finallyUnwatch = createWatch({
    unit: op.finished.finally,
    fn: onFinally,
    scope,
  });

  return {
    listeners: { onSuccess, onSkip, onFailure, onFinally, onStart },
    unwatch: () => {
      startUnwatch();
      doneUnwatch();
      skipUnwatch();
      errorUnwatch();
      finallyUnwatch();
    },
  };
}
