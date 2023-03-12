import {
  type Event,
  combine,
  sample,
  is,
  createStore,
  createEvent,
} from 'effector';

import { type Query } from '../query/type';
import { isEqual, divide } from '../libs/lohyphen';
import { not, delay } from '../libs/patronus';
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
    const finalyParams = query.finished.finally.map(({ params }) => params);
    const $previousSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) => sourced(finalyParams))
    );

    const sourcesUpdated = sample({
      clock: query.__.lowLevelAPI.sources,
      source: query.__.$latestParams,
      filter: not(query.$idle),
      fn: (params): Params => params!,
    });
    const $nextSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) => sourced(sourcesUpdated))
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
    // Use sync batching
    clock: delay({ clock: forceFresh, timeout: 0 }),
    source: query.__.$latestParams,
    filter: not(query.$idle),
    fn: (params) => params!,
    target: query.refresh,
  });
}
