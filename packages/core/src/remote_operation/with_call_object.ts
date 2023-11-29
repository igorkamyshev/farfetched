import {
  step,
  createEvent,
  type Effect,
  type Node,
  type Event,
  type EventCallable,
} from 'effector';

import { Defer, createDefer } from '../libs/lohyphen';
import { abortError } from '../errors/create_error';

export type CallObject = {
  id: string;
  /**
   * Rejectes promise with provided error and ignores rest of the handler
   *
   * @param error - Error to reject promise with, defaults to `OperationAborted` error
   */
  abort: (customError?: unknown) => void;
  /**
   * Status of the call
   *
   * For sync calls it is always `finished`
   */
  status: 'pending' | 'finished';
  /**
   * Promise of async handler calls,
   * it is resolved or rejected when handler is finished
   *
   * For sync handlers it is not presented
   */
  promise?: Promise<unknown>;
};

/**
 *
 * Patches effect handler to emit call object for each call of the effect,
 * each call object provides low level control over the call
 *
 * @param effect - Effect to patch
 * @returns event that emits call object for each call of the effect
 */
export function getCallObjectEvent<E extends Effect<unknown, unknown, unknown>>(
  effect: E
): Event<CallObject> {
  const called = createEvent<CallObject>(effect.shortName + '.internalCall');

  const callObjStep = step.compute({
    fn: (run) => {
      const originalHandler = run.handler;

      const patchedHandler = createPatchedHandler(originalHandler, called);

      run.handler = patchedHandler;

      return run;
    },
  });

  const runner = getEffectRunnerNode(effect);

  /**
   * First steps of the runner: resolve of params and handler
   * Last step is execution of the handler
   *
   * Insertion of the patched handler step must happen right before execution of the handler itself,
   * after everything else is resolved
   *
   * @see https://github.com/effector/effector/blob/a0f997b3d355c5a9b682e3747f00a1ffe7de8646/src/effector/__tests__/effect/index.test.ts#L432
   */
  runner.seq.splice(1, 0, callObjStep);

  return called;
}

function createPatchedHandler(
  h: (...p: unknown[]) => unknown,
  calledEvent: EventCallable<CallObject>
) {
  function ffMagicHandler(...p: unknown[]): unknown {
    /**
     * Normal flow of the handler,
     * its result is reflected to the outside world
     */
    const result = h(...p);
    if (result instanceof Promise) {
      /**
       * Async handlers are patched to emit call object,
       * which provides low level control over the call
       */

      const def = createDefer();
      const callObj = createCallObject(def);
      calledEvent(callObj);
      result.then(def.resolve, def.reject);

      return def.promise;
    } else {
      /**
       * It is not possible to control sync handlers at all, because their execution is instant
       * So call object is emitted as "finished" right away
       */
      const callObj = createCallObject();
      calledEvent(callObj);

      return result;
    }
  }

  return ffMagicHandler;
}

function createCallObject(def?: Defer<unknown, unknown>) {
  let callStatus: CallObject['status'] = def ? 'pending' : 'finished';

  function finish() {
    callStatus = 'finished';
    callObj.status = callStatus;
  }

  if (def) {
    def.promise.then(finish, finish);
  }

  const callObj: CallObject = {
    id: getCallId(),
    status: callStatus,
    abort: (error: unknown = abortError()) => {
      if (callStatus === 'finished') {
        /**
         * It is not possible to abort already finished call,
         * so nothing happens
         */
        return;
      }

      if (def) {
        def.reject(error);
      }
    },
    promise: def?.promise,
  };

  return callObj;
}

function getEffectRunnerNode(effect: Effect<unknown, unknown, unknown>): Node {
  const runner = (
    (effect as unknown as { graphite: Node }).graphite.scope as { runner: Node }
  ).runner;
  return runner;
}

let n = 0;
function getCallId(): string {
  const id = `${n++}`;

  return id;
}
