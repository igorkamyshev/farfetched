import {
  combine,
  createEvent,
  createStore,
  Event,
  merge,
  sample,
  Store,
} from 'effector';

import { type Query } from '../query/type';
import { normalizeSourced, type SourcedField } from '../libs/patronus';
import { isEqual } from '../libs/lohyphen';

export function keepFresh(
  query: Query<void, any, any>,
  config: { setup: Event<void> }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    setup: Event<void>;
    params: Store<Params>;
  }
): void;

export function keepFresh(
  query: Query<void, any, any>,
  config: {
    triggers: Array<Event<any>>;
  }
): void;

export function keepFresh<Params, Payload, ParamsSource = void>(
  query: Query<Params, any, any>,
  config: {
    triggers: Array<Event<Payload>>;
    params: SourcedField<Payload, Params, ParamsSource>;
  }
): void;

export function keepFresh(
  query: Query<any, any, any>,
  {
    params,
    triggers,
    setup,
  }: {
    params?: SourcedField<any, any, any>;
    triggers?: Array<Event<any>>;
    setup?: Event<void>;
  }
) {
  if (triggers) {
    sample({ clock: triggers, fn: () => true, target: query.$stale });

    sample({
      clock: triggers,
      source: normalizeSourced({ field: params, clock: merge(triggers) }),
      target: query.refresh,
    });

    return;
  }

  if (setup) {
    const checkUpdate = createEvent();

    const $nextParams: Store<any> = params ?? createStore(null);

    const $previousSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        sourced(query.finished.finally)
      )
    );
    const $nextSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        sourced(merge([...query.__.lowLevelAPI.sources, $nextParams.updates]))
      )
    );

    sample({
      clock: $nextSources,
      source: { prev: $nextSources, next: $previousSources },
      filter: ({ prev, next }) => !isEqual(prev, next),
      target: checkUpdate,
    });

    if (!query.__.lowLevelAPI.paramsAreMeaningless) {
      sample({
        clock: $nextParams.updates,
        target: checkUpdate,
      });
    }

    sample({ clock: checkUpdate, fn: () => true, target: query.$stale });
    sample({
      clock: [checkUpdate, setup],
      source: $nextParams,
      target: query.refresh,
    });

    return;
  }

  throw new Error('Logic error, impossible case');
}
