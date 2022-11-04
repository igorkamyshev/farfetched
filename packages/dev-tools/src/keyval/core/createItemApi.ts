import type { Event, EventPayload } from 'effector';

import type { ListApi, ItemApi, PossibleKey } from './types';

export function createItemApi<
  Item,
  Key extends PossibleKey,
  Evs extends Record<string, Event<any>>
>({
  kv,
  events,
}: {
  kv: ListApi<Item, Key>;
  events: Evs;
}): ItemApi<
  Item,
  Key,
  {
    [K in keyof Evs]: EventPayload<Evs[K]> extends { key: Key }
      ? EventPayload<Evs[K]> extends { key: Key; value: infer V }
        ? V
        : void
      : never;
  }
> {
  const api: any = {};
  for (const field in events) {
    api[field] = events[field];
  }
  const itemsApi = { kv, api } as any;

  return itemsApi;
}
