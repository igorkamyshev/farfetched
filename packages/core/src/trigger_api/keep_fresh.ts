import {
  type Event,
  createApi,
  combine,
  sample,
  is,
  createStore,
  merge,
} from 'effector';

import { type Query } from '../query/type';
import { divide, get, isEqual } from '../libs/lohyphen';
import {
  not,
  and,
  delay,
  normalizeSourced,
  extractSource,
} from '../libs/patronus';
import { type TriggerProtocol } from './trigger_protocol';

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    automatically: true;
  }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    triggers: Array<Event<unknown> | Event<void> | TriggerProtocol>;
  }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    automatically: true;
    triggers: Array<Event<unknown> | Event<void> | TriggerProtocol>;
  }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any>,
  config: {
    automatically?: true;
    triggers?: Array<Event<unknown> | Event<void> | TriggerProtocol>;
  }
): void {
  const triggers: Array<Event<any>> = [];

  const [triggerEvents, protocolCompatibleObjects] = divide(
    config.triggers ?? [],
    is.event
  );

  triggers.push(...triggerEvents);

  if (protocolCompatibleObjects.length > 0) {
    const triggersByProtocol = protocolCompatibleObjects.map((trigger) =>
      trigger['@@trigger']()
    );

    const $alreadySetup = createStore(false, { serialize: 'ignore' });

    const { setup, teardown } = createApi($alreadySetup, {
      setup: () => true,
      teardown: () => false,
    });

    sample({
      clock: [
        query.finished.success,
        sample({ clock: query.$enabled.updates, filter: query.$enabled }),
      ],
      filter: not($alreadySetup),
      target: [...triggersByProtocol.map(get('setup')), setup],
    });

    sample({
      clock: query.$enabled.updates,
      filter: and($alreadySetup, not(query.$enabled)),
      target: [...triggersByProtocol.map(get('teardown')), teardown],
    });

    triggers.push(...triggersByProtocol.map(get('fired')));
  }

  if (config.automatically) {
    const finalyParams = query.finished.finally.map(get('params'));
    const $previousSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        normalizeSourced({ field: sourced, clock: finalyParams })
      )
    );

    const sourcesUpdated = sample({
      clock: query.__.lowLevelAPI.sourced.map(extractSource).filter(is.store),
      source: query.__.$latestParams,
      filter: not(query.$idle),
      fn: (params): Params => params!,
    });
    const $nextSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        normalizeSourced({ field: sourced, clock: sourcesUpdated })
      )
    );

    triggers.push(
      sample({
        clock: $nextSources.updates,
        source: [$nextSources, $previousSources] as const,
        filter: ([next, prev]) => !isEqual(next, prev),
      })
    );
  }

  const forceFresh = merge(triggers);

  sample({
    clock: forceFresh,
    filter: not(query.$idle),
    fn: () => true,
    target: query.$stale,
  });

  // @ts-expect-error TS cannot get that if query.$idle is false, then $latestParams is Params
  sample({
    // Use sync batching
    clock: delay({ clock: forceFresh, timeout: 0 }),
    source: query.__.$latestParams,
    filter: not(query.$idle),
    target: query.refresh,
  });
}
