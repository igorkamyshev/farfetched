import { createWatch, Event, Scope } from 'effector';

interface QueryLike {
  start: Event<any>;
  done: {
    success: Event<any>;
    error: Event<any>;
    skip: Event<void>;
    finally: Event<void>;
  };
}

function watchQuery(query: QueryLike, scope: Scope) {
  const onStart = jest.fn();

  const onDone = jest.fn();
  const onSkip = jest.fn();
  const onError = jest.fn();
  const onFinally = jest.fn();

  const startUnwatch = createWatch({ unit: query.start, fn: onStart, scope });

  const doneUnwatch = createWatch({
    unit: query.done.success,
    fn: onDone,
    scope,
  });
  const skipUnwatch = createWatch({ unit: query.done.skip, fn: onSkip, scope });
  const errorUnwatch = createWatch({
    unit: query.done.error,
    fn: onError,
    scope,
  });
  const finallyUnwatch = createWatch({
    unit: query.done.finally,
    fn: onFinally,
    scope,
  });

  return {
    listeners: { onDone, onSkip, onError, onFinally, onStart },
    unwatch: () => {
      startUnwatch();
      doneUnwatch();
      skipUnwatch();
      errorUnwatch();
      finallyUnwatch();
    },
  };
}

export { watchQuery };
