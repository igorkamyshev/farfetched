import { createWatch, Effect, Scope } from 'effector';

function watchEffect(effectFx: Effect<any, any, any>, scope: Scope) {
  const onCall = jest.fn();
  createWatch({ unit: effectFx, fn: onCall, scope });

  const onDone = jest.fn();
  const onDoneData = jest.fn();
  createWatch({ unit: effectFx.done, fn: onDone, scope });
  createWatch({ unit: effectFx.doneData, fn: onDoneData, scope });

  const onFail = jest.fn();
  const onFailData = jest.fn();
  createWatch({ unit: effectFx.fail, fn: onFail, scope });
  createWatch({ unit: effectFx.failData, fn: onFailData, scope });

  const onFinally = jest.fn();
  effectFx.finally.watch(onFinally);

  return {
    listeners: { onCall, onDone, onDoneData, onFail, onFailData, onFinally },
  };
}

export { watchEffect };
