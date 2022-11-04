import type { ListApi, Selection, IndexApi, PossibleKey } from './types';
import { addAlwaysActivatedConsumer } from './consumerPort';

export function createIndex<
  Item,
  Key extends PossibleKey,
  Field extends keyof Item
>(args: {
  field: Field;
  selection: Selection<Item, Key>;
}): IndexApi<Item, Key, Field>;
export function createIndex<
  Item,
  Key extends PossibleKey,
  Field extends keyof Item
>(args: { field: Field; kv: ListApi<Item, Key> }): IndexApi<Item, Key, Field>;
export function createIndex<
  Item,
  Key extends PossibleKey,
  Field extends keyof Item
>({
  kv,
  field,
  selection,
}: {
  kv?: ListApi<Item, Key>;
  field: Field;
  selection?: Selection<Item, Key>;
}): IndexApi<Item, Key, Field> {
  if (!kv && !selection) {
    throw new Error(`Can't create index without kv or selection`);
  }

  const fn = (items: Record<Key, Item>) => {
    const result = new Map<Item[Field], Key[]>();

    for (const key in items) {
      const value = items[key];
      const indexValue = value[field];
      let bucket = result.get(indexValue);
      if (!bucket) {
        bucket = [];
        result.set(indexValue, bucket);
      }
      bucket.push(key);
    }
    return result;
  };

  if (selection) {
    addAlwaysActivatedConsumer(selection.port);
  }

  const groups = selection
    ? selection.state.items.map(fn)
    : kv!.state.store.map(({ ref }) => fn(ref));

  return {
    field,
    groups,
  };
}
