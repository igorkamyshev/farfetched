import { combine, createEvent, type Event, merge, sample } from 'effector';

import { type Query } from '../query/type';
import { isEqual } from '../libs/lohyphen';
import { not } from '../libs/patronus';

export function keepFresh(query: Query<any, any, any>): void;

export function keepFresh(
  query: Query<any, any, any>,
  config: {
    triggers: Array<Event<any>>;
  }
): void;

export function keepFresh<Params, Payload, ParamsSource = void>(
  query: Query<Params, any, any>,
  config: {
    triggers: Array<Event<Payload>>;
  }
): void;

export function keepFresh(
  query: Query<any, any, any>,
  config?: {
    triggers?: Array<Event<any>>;
  }
) {
  const $latestParams = query.__.$latestParams;

  if (config?.triggers) {
    sample({ clock: config.triggers, fn: () => true, target: query.$stale });

    sample({
      clock: config.triggers,
      filter: not(query.$idle),
      source: $latestParams,
      target: query.refresh,
    });
  } else {
    const checkUpdate = createEvent();

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

    sample({
      clock: $nextSources,
      source: { prev: $nextSources, next: $previousSources },
      filter: ({ prev, next }) => !isEqual(prev, next),
      target: checkUpdate,
    });

    sample({
      clock: checkUpdate,
      filter: not(query.$idle),
      fn: () => true,
      target: query.$stale,
    });
    sample({
      clock: checkUpdate,
      source: $latestParams,
      filter: not(query.$idle),
      target: query.refresh,
    });
  }
}
