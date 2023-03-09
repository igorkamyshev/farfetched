import {
  combine,
  type Event,
  merge,
  sample,
  is,
  createStore,
  createEvent,
} from 'effector';

import { type Query } from '../query/type';
import { isEqual, divide } from '../libs/lohyphen';
import { not } from '../libs/patronus';
import { TriggerProtocol } from './trigger_protocol';

export function keepFresh(query: Query<any, any, any>): void;

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    triggers: Array<Event<unknown> | Event<void> | TriggerProtocol>;
  }
): void;

export function keepFresh(
  query: Query<any, any, any>,
  config?: {
    triggers?: Array<Event<unknown> | Event<void> | TriggerProtocol>;
  }
) {
  const forceFresh = createEvent();
  const triggers: Array<Event<unknown> | Event<void> | TriggerProtocol> = [];

  if (config?.triggers) {
    triggers.push(...config.triggers);
  } else {
    const $previousSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        sourced(query.finished.finally)
      )
    );
    const $nextSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        sourced(merge(query.__.lowLevelAPI.sources))
      )
    );

    triggers.push(
      sample({
        clock: $nextSources,
        source: { prev: $nextSources, next: $previousSources },
        filter: ({ prev, next }) => !isEqual(prev, next),
        fn: () => null as unknown,
      })
    );
  }

  const [triggerEvents, triggersByProtocol] = divide(triggers, is.event);
  const resolvedTriggersByProtocol = triggersByProtocol.map((trigger) =>
    trigger['@@trigger']()
  );

  if (resolvedTriggersByProtocol.length > 0) {
    const $alreadySetup = createStore(false, { serialize: 'ignore' });

    sample({
      clock: query.refresh,
      filter: not($alreadySetup),
      fn: () => true,
      target: [
        ...resolvedTriggersByProtocol
          .map((trigger) => trigger.setup)
          .filter(is.event),
        $alreadySetup,
      ],
    });
  }

  sample({
    clock: [
      ...triggerEvents,
      ...resolvedTriggersByProtocol.map((trigger) => trigger.fired),
    ],
    target: forceFresh,
  });

  sample({
    clock: forceFresh,
    filter: not(query.$idle),
    fn: () => true,
    target: query.$stale,
  });

  sample({
    clock: forceFresh,
    source: query.__.$latestParams,
    filter: not(query.$idle),
    target: query.refresh,
  });
}
