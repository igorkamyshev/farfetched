import {
  type Event,
  combine,
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

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    onSourcesUpdate?: true;
    onTriggers?: Array<Event<unknown> | Event<void> | TriggerProtocol>;
  }
) {
  const forceFresh = createEvent();
  const triggers: Array<Event<unknown> | Event<void> | TriggerProtocol> = [];

  if (config.onTriggers) {
    triggers.push(...config.onTriggers);
  }

  if (config.onSourcesUpdate) {
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

    const setup = createEvent();
    const teardown = createEvent();

    sample({
      clock: setup,
      filter: not($alreadySetup),
      target: resolvedTriggersByProtocol.map((trigger) => trigger.setup),
    });

    sample({ clock: setup, fn: () => true, target: $alreadySetup });

    sample({
      clock: teardown,
      filter: $alreadySetup,
      target: resolvedTriggersByProtocol.map((trigger) => trigger.teardown),
    });

    sample({ clock: teardown, fn: () => false, target: $alreadySetup });

    sample({
      clock: [
        query.finished.success,
        sample({ clock: query.$enabled.updates, filter: query.$enabled }),
      ],
      target: setup,
    });

    sample({
      clock: query.$enabled.updates,
      filter: not(query.$enabled),
      target: teardown,
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
    fn: (params) => params!,
    target: query.refresh,
  });
}
