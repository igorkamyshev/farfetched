import { combine } from 'effector';
import type { Aggregate, ListApi, Selection, PossibleKey } from './types';

import { createIndex } from './createIndex';

export function createAggregate<
  Item,
  AggregateField extends keyof Item,
  Key extends PossibleKey,
  Aggregation
>({
  kv,
  aggregateField,
  fn,
  selection,
  when,
  defaultValue,
}: {
  kv: ListApi<Item, Key>;
  aggregateField: AggregateField;
  fn: (items: Item[], groupID: Item[AggregateField]) => Aggregation;
  when?: (item: Item, groupID: Item[AggregateField]) => boolean;
  selection?: Selection<Item, Key>;
  defaultValue: Aggregation;
}): Aggregate<Item, Key, AggregateField, Aggregation> {
  const index = selection
    ? createIndex({ field: aggregateField, selection })
    : createIndex({ kv, field: aggregateField });

  const values = combine(kv.state.store, index.groups, (kv, indexGroups) => {
    const result = new Map<Item[AggregateField], Aggregation>();

    for (const [key, group] of indexGroups) {
      const vals: Item[] = [];
      for (const id of group) {
        const item = kv.ref[id];

        if (!when || when(item, key)) {
          vals.push(item);
        }
      }

      result.set(key, fn(vals, key));
    }
    return result;
  });

  return {
    kv,
    index,
    config: {
      aggregateField,
      fn,
      selection,
      when,
      defaultValue,
    },
    values,
  };
}
