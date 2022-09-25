import {
  createEffect,
  createEvent,
  createStore,
  sample,
  Store,
} from 'effector';
import { FetchingStatus } from '../status/type';
import { RemoteOperation } from './type';

function createRemoteOperation<Params, Data, Error, Meta>({
  name,
  meta,
  kind,
  serialize,
  $enabled,
}: {
  name: string;
  meta: Meta;
  kind: unknown;
  serialize?: 'ignore';
  $enabled: Store<boolean>;
}): RemoteOperation<Params, Data, Error, Meta> {
  // Dummy effect, it will be replaced with real in head-full factory
  const executeFx = createEffect<any, any, any>({
    handler: () => {
      throw new Error('Not implemented');
    },
    sid: `ff.${name}.executeFx`,
    name: `${name}.executeFx`,
  });

  /*
   * Start event, it's used as it or to pipe it in head-full factory
   *
   * sample({
   *  clock: externalStart,
   *  target: headlessQuery.start,
   *  greedy: true
   * })
   */
  const start = createEvent<Params>();

  // Signal-events
  const finished = {
    success: createEvent<{ params: Params; data: Data }>(),
    failure: createEvent<{ params: Params; error: Error }>(),
    skip: createEvent<{ params: Params }>(),
    finally: createEvent<{ params: Params }>(),
  };

  // -- Main stores --
  const $status = createStore<FetchingStatus>('initial', {
    sid: `ff.${name}.$status`,
    name: `${name}.$status`,
    serialize,
  });

  // -- Derived stores --
  const $pending = $status.map((status) => status === 'pending');
  const $failed = $status.map((status) => status === 'fail');
  const $succeeded = $status.map((status) => status === 'done');

  // -- Indicate status --
  sample({
    clock: [
      start.map(() => 'pending' as const),
      finished.success.map(() => 'done' as const),
      finished.failure.map(() => 'fail' as const),
    ],
    target: $status,
  });

  // -- Send finally --
  sample({
    clock: [finished.success, finished.failure, finished.skip],
    fn({ params }) {
      return { params };
    },
    target: finished.finally,
  });

  return {
    start,
    finished,
    $status,
    $pending,
    $failed,
    $succeeded,
    $enabled,
    __: { executeFx, meta, kind },
  };
}

export { createRemoteOperation };
