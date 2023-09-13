import { attach, sample } from 'effector';
import {
  normalizeStaticOrReactive,
  type StaticOrReactive,
} from '../libs/patronus';
import { type RemoteOperation } from '../remote_operation/type';
import { type Time, parseTime } from '../libs/date-nfs';
import { CallObject } from '../remote_operation/with_call_object';
import { timeoutError } from '../errors/create_error';

export function timeout<Q extends RemoteOperation<any, any, any, any>>(
  operation: Q,
  config: { after: StaticOrReactive<Time> }
): void {
  const timeoutAbortFx = attach({
    source: normalizeStaticOrReactive(config.after).map(parseTime),
    effect(timeoutMs, callObj: CallObject) {
      return new Promise<void>((resolve) => {
        // Setup call abort by timeout
        const timeout = setTimeout(() => {
          callObj.abort(timeoutError({ timeout: timeoutMs }));
          resolve();
        }, timeoutMs);

        // Setup timeout cleanup if call is finished before timeout
        const cleanup = () => {
          clearTimeout(timeout);
          resolve();
        };

        callObj.promise?.then(cleanup, cleanup);
      });
    },
  });

  sample({
    clock: operation.__.lowLevelAPI.callObjectCreated,
    target: timeoutAbortFx,
  });
}
