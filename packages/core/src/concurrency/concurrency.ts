import {
  type Event,
  createStore,
  sample,
  attach,
  createEffect,
  createEvent,
} from 'effector';
import { type RemoteOperation } from '../remote_operation/type';
import { type CallObject } from '../remote_operation/with_call_object';
import { abortError } from '../errors/create_error';

/**
 * @param op Query or Mutation to apply concurrency to
 * @param config.strategy  Auto-cancelation strategy
 * - `TAKE_EVERY` will not cancel any requests
 * - `TAKE_LATEST` will cancel all but the latest request
 * - `TAKE_FIRST` will ignore all but the first request
 * @param config.abortAll All requests will be aborted on this event call
 */
export function concurrency(
  op: RemoteOperation<any, any, any, any>,
  {
    strategy,
    abortAll,
  }: {
    strategy?: 'TAKE_LATEST' | 'TAKE_EVERY' | 'TAKE_FIRST';
    abortAll?: Event<any>;
  }
) {
  if (op.__.meta.flags.concurrencyFieldUsed) {
    console.error(
      `Both concurrency-operator and concurrency-field are used  on operation ${op.__.meta.name}.`,
      `Please use only concurrency-operator, because field concurrency-field in createJsonQuery and createJsonMutation is deprecated and will be deleted soon.`
    );
  }
  op.__.meta.flags.concurrencyOperatorUsed = true;

  const $callObjects = createStore<CallObject[]>([], { serialize: 'ignore' });
  sample({
    clock: op.__.lowLevelAPI.callObjectCreated,
    source: $callObjects,
    fn: (callObjects, callObject) =>
      callObjects.filter((obj) => obj.status === 'pending').concat(callObject),
    target: $callObjects,
  });

  const abortManyFx = createEffect((callObjects: CallObject[]) => {
    callObjects.forEach((callObject) => callObject.abort());
  });

  const abortAllFx = attach({
    source: $callObjects,
    effect: abortManyFx,
  });

  sample({
    clock: abortManyFx.done,
    source: $callObjects,
    fn: (callObjects, { params: abortedCallObjects }) =>
      callObjects.filter((obj) => !abortedCallObjects.includes(obj)),
    target: $callObjects,
  });

  if (strategy) {
    switch (strategy) {
      case 'TAKE_EVERY':
        /* do nothing */
        break;
      case 'TAKE_FIRST': {
        const $haveToAbort = createStore(false, { serialize: 'ignore' });
        const markAsHaveToAbort = createEvent();

        sample({
          clock: markAsHaveToAbort,
          fn: () => true,
          target: $haveToAbort,
        });

        const concurrencyDataSource = {
          name: 'concurrency',
          get: attach({
            source: $haveToAbort,
            async effect(
              haveToAbort,
              _original: any
            ): Promise<{ result: unknown; stale: boolean } | null> {
              if (haveToAbort) {
                throw abortError();
              }

              markAsHaveToAbort();

              return null;
            },
          }),
        };
        op.__.lowLevelAPI.dataSources.unshift(concurrencyDataSource);

        sample({
          clock: op.finished.finally,
          fn: () => false,
          target: $haveToAbort,
        });

        break;
      }
      case 'TAKE_LATEST': {
        sample({
          clock: op.__.lowLevelAPI.callObjectCreated,
          source: $callObjects,
          fn: (callObjects, currentCallObject) =>
            callObjects.filter((obj) => obj !== currentCallObject),
          target: abortManyFx,
        });
        break;
      }
    }
  }

  if (abortAll) {
    sample({ clock: abortAll, target: abortAllFx });
  }

  return op;
}
