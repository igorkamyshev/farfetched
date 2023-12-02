import {
  attach,
  createEvent,
  createStore,
  is,
  sample,
  split,
  type EventCallable,
  type Effect,
  type Event,
  type Store,
} from 'effector';

import { type RemoteOperation } from '../remote_operation/type';
import { type Barrier } from './type';
import { combineEvents, not, readonly } from '../libs/patronus';
import { isQuery } from '../query/type';
import { isMutation } from '../mutation/type';
import { get, Mutex } from '../libs/lohyphen';

type Performer =
  | RemoteOperation<void, any, any, any>
  | Effect<void, any, any>
  | { start: EventCallable<void>; end: Event<any> };

type NormalizedPerformer = {
  start: EventCallable<void> | Effect<void, any, any>;
  end: Event<void>;
  $pending: Store<boolean>;
};

/**
 * Creates new Barrier
 * @param config.active Store that holds the Barrier status
 * @param config.perform Array of Performers that should be started when active Barrier is touched
 */
export function createBarrier(config: {
  active: Store<boolean>;
  perform?: Array<Performer>;
}): Barrier;

/**
 * Creates new Barrier
 * @param config.activateOn Event that will activate Barrier
 * @param config.deactivateOn Event that will deactivate Barrier
 */
export function createBarrier(config: {
  activateOn: Event<any>;
  deactivateOn: Event<any>;
}): Barrier;

/**
 * Creates new Barrier
 * @param config.activateOn.failure A function that will be called every time when operation with applied Barrier fails. If it returns true, Barrier will be activated.
 * @param config.perform Array of Performers that should be started when active Barrier is touched
 */
export function createBarrier(config: {
  activateOn: {
    failure: (options: { params: unknown; error: unknown }) => boolean;
  };
  perform: Array<Performer>;
}): Barrier;

export function createBarrier({
  active,
  perform,
  activateOn,
  deactivateOn,
}: {
  active?: Store<boolean>;
  activateOn?:
    | Event<any>
    | {
        failure: (options: { params: unknown; error: unknown }) => boolean;
      };
  deactivateOn?: Event<any>;
  perform?: Array<Performer>;
}): Barrier {
  const $mutex = createStore<Mutex | null>(null, { serialize: 'ignore' });

  const activated = createEvent();
  const deactivated = createEvent();

  const touch = createEvent();

  sample({
    clock: touch,
    source: $mutex,
    filter: (mutex) => mutex === null,
    fn: () => new Mutex(),
    target: $mutex,
  });

  sample({
    clock: activated,
    target: attach({
      source: $mutex,
      async effect(mutex) {
        await mutex?.acquire();
      },
    }),
  });

  sample({
    clock: deactivated,
    target: attach({
      source: $mutex,
      async effect(mutex) {
        mutex?.release();
      },
    }),
  });

  const operationFailed = createEvent<{
    params: unknown;
    error: unknown;
  }>();
  const operationDone = createEvent<{
    params: unknown;
    result: unknown;
  }>();

  const performers = normalizePerformers(perform ?? []);

  let $active;
  // Overload: active
  if (active) {
    $active = active;
  }
  // Overload: activateOn/deactivateOn
  else if (is.event(activateOn) && is.event(deactivateOn)) {
    $active = createStore(false, {
      sid: 'barrier.$active',
      name: 'barrier.$active',
    })
      .on(activateOn, () => true)
      .on(deactivateOn, () => false);
  }
  // Overload: activateOn only
  else if (activateOn) {
    $active = createStore(false, {
      sid: 'barrier.$active',
      name: 'barrier.$active',
    });

    if ('failure' in activateOn && activateOn.failure) {
      const callback = activateOn.failure;
      sample({
        clock: operationFailed,
        filter: ({ error, params }) => callback({ error, params }),
        fn: () => true,
        target: [$active, touch],
      });

      sample({
        clock: combineEvents({
          events: performers.map(get('end')),
          reset: operationFailed,
        }),
        fn: () => false,
        target: $active,
      });
    }
  } else {
    throw new Error('Invalid configuration of createBarrier');
  }

  split({
    clock: [$active, touch],
    source: $active,
    match: { activated: Boolean },
    cases: { activated, __: deactivated },
  });

  sample({
    clock: touch,
    filter: $active,
    target: startOnlyNotPending(performers),
  });

  return {
    $active: readonly($active),
    activated: readonly(activated),
    deactivated: readonly(deactivated),
    __: { touch, operationFailed, operationDone, $mutex },
  };
}

function startOnlyNotPending(
  performers: NormalizedPerformer[]
): EventCallable<void> {
  const clock = createEvent();

  for (const { start, $pending } of performers) {
    // @ts-expect-error 😇😇😇
    sample({
      clock,
      filter: not($pending),
      target: start,
    });
  }

  return clock;
}

function normalizePerformers(performers: Performer[]): NormalizedPerformer[] {
  return performers.map((performer) => {
    if (perforerIsRemoteOperation(performer)) {
      return {
        start: performer.start,
        end: toVoid(
          sample({
            clock: [performer.finished.success, performer.finished.skip],
          })
        ),
        $pending: performer.$pending,
      };
    } else if (performerIsEffect(performer)) {
      return {
        start: performer,
        end: toVoid(performer.done),
        $pending: performer.pending,
      };
    } else {
      const $pending = createStore(false, { serialize: 'ignore' })
        .on(performer.start, () => true)
        .on(performer.end, () => false);
      return { ...performer, $pending };
    }
  });
}

function perforerIsRemoteOperation(
  performer: Performer
): performer is RemoteOperation<void, any, any, any> {
  return isQuery(performer) || isMutation(performer);
}

function performerIsEffect(
  performer: Performer
): performer is Effect<void, any, any> {
  return is.effect(performer);
}

function toVoid(event: Event<any>): Event<void> {
  return sample({
    clock: event,
    fn: () => {
      // pass
    },
  });
}
