import {
  type Event,
  createApi,
  combine,
  sample,
  is,
  createStore,
  Store,
} from 'effector';

import { type Query } from '../query/type';
import { divide, get, isEqual } from '../libs/lohyphen';
import {
  not,
  and,
  syncBatch,
  normalizeSourced,
  extractSource,
  every,
} from '../libs/patronus';
import { type TriggerProtocol } from './trigger_protocol';

export function keepFresh<Params>(
  query: Query<Params, any, any, any>,
  config: {
    automatically: true;
    enabled?: Store<boolean>;
  }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any, any>,
  config: {
    triggers: Array<Event<any> | TriggerProtocol>;
    enabled?: Store<boolean>;
  }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any, any>,
  config: {
    automatically: true;
    triggers: Array<Event<any> | TriggerProtocol>;
    enabled?: Store<boolean>;
  }
): void;

export function keepFresh<Params>(
  query: Query<Params, any, any, any>,
  config: {
    automatically?: true;
    triggers?: Array<Event<any> | TriggerProtocol>;
    enabled?: Store<boolean>;
  }
): void {
  const triggers: Array<Event<any>> = [];

  const [triggerEvents, protocolCompatibleObjects] = divide(
    config.triggers ?? [],
    is.event
  );

  triggers.push(...triggerEvents);

  const enabledParamStores = [query.$enabled];
  if (config.enabled !== undefined) {
    enabledParamStores.push(config.enabled);
  }

  const $enabled = every({
    predicate: Boolean,
    stores: enabledParamStores,
  });

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
        sample({ clock: $enabled.updates, filter: $enabled }),
      ],
      filter: not($alreadySetup),
      target: [...triggersByProtocol.map(get('setup')), setup],
    });

    sample({
      clock: $enabled.updates,
      filter: and($alreadySetup, not($enabled)),
      target: [...triggersByProtocol.map(get('teardown')), teardown],
    });

    triggers.push(...triggersByProtocol.map(get('fired')));
  }

  if (config.automatically) {
    const finalyParams = query.finished.finally.map(get('params'));

    const $previousSources = createStore<any[]>([], { serialize: 'ignore' });

    const $partialSources = combine(
      query.__.lowLevelAPI.sourced.map((sourced) =>
        normalizeSourced({ field: sourced })
      )
    );

    // @ts-expect-error I have no idea
    sample({
      clock: finalyParams,
      source: $partialSources,
      fn: (partialSources, clock) =>
        partialSources.map((partialSource) => partialSource(clock)),
      filter: $enabled,
      target: $previousSources,
    });

    const $nextSources = createStore(null, { serialize: 'ignore' });

    sample({
      // @ts-expect-error I have no idea
      clock: query.__.lowLevelAPI.sourced.map(extractSource).filter(is.store),
      source: {
        latestParams: query.__.$latestParams,
        partialSources: $partialSources,
      },
      filter: not(query.$idle),
      fn: ({ latestParams, partialSources }) =>
        partialSources.map((partialSource) => partialSource(latestParams)),
      target: $nextSources,
    });

    triggers.push(
      sample({
        clock: [$nextSources.updates, $enabled.updates.filter({ fn: Boolean })],
        source: [$nextSources, $previousSources] as const,
        filter: ([next, prev]) => !isEqual(next, prev),
      })
    );
  }

  const forceFresh = sample({ clock: triggers, filter: $enabled });

  sample({
    clock: forceFresh,
    filter: not(query.$idle),
    fn: () => true,
    target: query.$stale,
  });

  // @ts-expect-error TS cannot get that if query.$idle is false, then $latestParams is Params
  sample({
    clock: syncBatch(forceFresh),
    source: query.__.$latestParams,
    filter: not(query.$idle),
    target: query.refresh,
  });
}
