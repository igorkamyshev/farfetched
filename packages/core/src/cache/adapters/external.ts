import { createEffect, createEvent, Event, sample } from 'effector';

import { createAdapter } from './instance';
import { attachObservability } from './observability';
import { CacheAdapter } from './type';

interface NarrowObservability {
  hit?: Event<{ key: string }>;
  miss?: Event<{ key: string }>;
}

export function externalCache(config: {
  get: (opts: {
    key: string;
  }) =>
    | Promise<{ value: unknown; cachedAt: number } | null>
    | { value: unknown; cachedAt: number }
    | null;
  set: (opts: { key: string; value: unknown }) => Promise<void> | void;
  purge: () => Promise<void> | void;
  observability?: NarrowObservability;
}): CacheAdapter {
  const purge = createEvent();
  const purgeFx = createEffect(config.purge);
  sample({ clock: purge, target: purgeFx });

  const adapter = {
    get: createEffect(config.get),
    set: createEffect(config.set),
    purge,
  };

  attachObservability({ adapter, options: config.observability });

  return createAdapter(adapter);
}
