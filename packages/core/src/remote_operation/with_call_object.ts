import {
  step,
  createEvent,
  type Effect,
  type Node,
  type Event,
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
  abort: () => void;
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
   */
  runner.seq.splice(runner.seq.length - 1, 0, callObjStep);

  return called;
}

function createPatchedHandler(
  h: (...p: unknown[]) => unknown,
  calledEvent: Event<CallObject>
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
       * It is not possible to control sync handlers at all,
       * so call object is not emitted to preserve consistent behavior
       */

      return result;
    }
  }

  return ffMagicHandler;
}

function createCallObject(def: Defer<unknown, unknown>) {
  let callStatus: 'pending' | 'finished' = 'pending';

  function finish() {
    callStatus = 'finished';
  }

  def.promise.then(finish, finish);

  const callObj: CallObject = {
    id: getCallId(),
    abort: (error: unknown = abortError()) => {
      if (callStatus === 'finished') {
        /**
         * It is not possible to abort already finished call,
         * so nothing happens
         */
        return;
      }

      def.reject(error);
    },
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
