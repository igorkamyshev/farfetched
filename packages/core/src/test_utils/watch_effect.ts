import { createWatch, Effect, Scope } from 'effector';
import { vi, type MockedFunction } from 'vitest';

type EffectWatch = {
  listeners: {
    onCall: MockedFunction<any>;
    onDone: MockedFunction<any>;
    onDoneData: MockedFunction<any>;
    onFail: MockedFunction<any>;
    onFailData: MockedFunction<any>;
    onFinally: MockedFunction<any>;
  };
};

export function watchEffect(
  effectFx: Effect<any, any, any>,
  scope: Scope
): EffectWatch {
  const onCall = vi.fn();
  createWatch({ unit: effectFx, fn: onCall, scope });

  const onDone = vi.fn();
  const onDoneData = vi.fn();
  createWatch({ unit: effectFx.done, fn: onDone, scope });
  createWatch({ unit: effectFx.doneData, fn: onDoneData, scope });

  const onFail = vi.fn();
  const onFailData = vi.fn();
  createWatch({ unit: effectFx.fail, fn: onFail, scope });
  createWatch({ unit: effectFx.failData, fn: onFailData, scope });

  const onFinally = vi.fn();
  effectFx.finally.watch(onFinally);

  return {
    listeners: { onCall, onDone, onDoneData, onFail, onFailData, onFinally },
  };
}
