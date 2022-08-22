import { createWatch, Event, Scope } from 'effector';

interface QueryLike {
  start: Event<any>;
  finished: {
    success: Event<any>;
    failure: Event<any>;
    skip: Event<any>;
    finally: Event<any>;
  };
}

function watchQuery(query: QueryLike, scope: Scope) {
  const onStart = jest.fn();

  const onSuccess = jest.fn();
  const onSkip = jest.fn();
  const onFailure = jest.fn();
  const onFinally = jest.fn();

  const startUnwatch = createWatch({ unit: query.start, fn: onStart, scope });

  const doneUnwatch = createWatch({
    unit: query.finished.success,
    fn: onSuccess,
    scope,
  });
  const skipUnwatch = createWatch({
    unit: query.finished.skip,
    fn: onSkip,
    scope,
  });
  const errorUnwatch = createWatch({
    unit: query.finished.failure,
    fn: onFailure,
    scope,
  });
  const finallyUnwatch = createWatch({
    unit: query.finished.finally,
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

export { watchQuery };
