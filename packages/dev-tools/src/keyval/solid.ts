import { useStoreMap, useUnit } from 'effector-solid';
import { Accessor } from 'solid-js';

import { ItemApi, PossibleKey } from './core';

export function useItemState<Item, Key extends PossibleKey>(
  id: Key,
  itemApi: ItemApi<Item, Key, any>
): Accessor<Item> {
  return useStoreMap({
    store: itemApi.kv.state.store,
    fn: (items) => itemApi.kv.config.getItem(items.ref, id),
    keys: [id],
  });
}

export function useItemApi<
  Key extends PossibleKey,
  T extends ItemApi<any, Key, any>
>(
  id: Key,
  itemApi: T
): T extends ItemApi<any, Key, infer Evs>
  ? { [K in keyof Evs]: (params: Evs[K]) => void }
  : never {
  const events = useUnit(itemApi.api);

  const api: any = {};

  for (const field in events) {
    api[field] = (value: any) => {
      events[field]({ key: id, value });
    };
  }

  return api;
}
