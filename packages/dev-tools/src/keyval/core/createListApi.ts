import { createStore, createEvent, sample } from 'effector';

import type { PossibleKey, ListApi, Selection } from './types';
import { createIndex } from './createIndex';

export function createListApi<Item, Key extends PossibleKey>({
  keygen,
}: {
  keygen: (draft: Item) => Key;
}): ListApi<Item, Key> {
  type KV = Record<Key, Item>;

  const $kv = createStore<{ ref: KV }>({
    ref: {} as KV,
  });

  const setAll = createEvent<{ key: keyof Item; value: Item[keyof Item] }>();
  $kv.on(setAll, (kv, { key, value }) => {
    kv = { ref: kv.ref };
    for (const id in kv) {
      kv.ref[id as Key] = { ...kv.ref[id as Key], [key]: value };
    }
    return kv;
  });
  const addItem = createEvent<
    { key: Key; value: Item } | Array<{ key: Key; value: Item }>
  >();
  const removeItem = createEvent<{ key: Key } | { key: Key }[]>();
  const removeWhen = createEvent<{
    field: keyof {
      [K in keyof Item]: Item[K] extends boolean ? Item[K] : never;
    };
  }>();
  const mapItem = createEvent<{
    key: Key;
    value: any;
    fn: (value: Item, data: any) => Partial<Item>;
  }>();

  $kv.on(addItem, (kv, updates) => {
    let kvChanged = false;
    arrifyIterate(updates, ({ key, value }) => {
      if (key === undefined) return;
      if (key in kv.ref && value === kv.ref[key]) return;

      kvChanged = true;
      kv.ref[key] = value;
    });

    return kvChanged ? { ref: kv.ref } : kv;
  });
  $kv.on(mapItem, (kv, { key, value, fn }) => {
    if (key in kv.ref) {
      const upd = fn(kv.ref[key], value);
      kv.ref[key] = { ...kv.ref[key], ...upd };
      return { ref: kv.ref };
    }
    return undefined;
  });
  $kv.on(removeWhen, (kv, { field }) => ({
    ref: filterKV(kv.ref, (val) => !val[field]),
  }));
  $kv.on(removeItem, (kv, itemOrItems) => {
    let kvChanged = false;
    arrifyIterate(itemOrItems, ({ key }) => {
      if (key in kv.ref) {
        kvChanged = true;
        delete kv.ref[key];
      }
    });
    return kvChanged ? { ref: kv.ref } : kv;
  });
  const listApi: ListApi<Item, Key> = {
    config: {
      getItem: (store: KV, key: Key | [Key]): Item =>
        store[Array.isArray(key) ? key[0] : key],
    },
    state: {
      store: $kv,
    },
    events: {
      setAll,
      addItem,
      removeItem,
      removeWhen,
      mapItem,
    },
    mapItem(fn: (value: Item, data: any) => Partial<Item>) {
      const result = createEvent<{ key: Key; value: any }>();
      sample({
        clock: result,
        fn: ({ key, value }) => ({ key, value, fn }),
        target: mapItem,
      });
      return result as any;
    },
    removeItem<ChildField extends keyof Item>(config?: {
      removeChilds: {
        childField: ChildField;
        selection?: Selection<Item, Key>;
      };
    }) {
      if (!config) {
        return removeItem.prepend(({ key }: { key: Key }) => ({ key }));
      }

      const {
        removeChilds: { childField, selection },
      } = config;
      const index = selection
        ? createIndex({
            field: childField,
            selection,
          })
        : createIndex({ kv: listApi, field: childField });

      const removeItemTrigger = createEvent<{ key: Key }>();
      function processItem(
        key: Key & Item[ChildField] & string,
        groups: Map<Item[ChildField], Key[]>,
        kv: KV,
        keysToRemove: string[]
      ) {
        const item = kv[key];
        if (!item) return;
        if (keysToRemove.includes(key)) return;
        keysToRemove.push(key);
        const group = groups.get(key);
        if (!group) return;
        group.forEach((child) =>
          processItem(
            child as Key & Item[ChildField] & string,
            groups,
            kv,
            keysToRemove
          )
        );
      }
      sample({
        clock: removeItemTrigger,
        source: { groups: index.groups, kv: $kv },
        fn({ groups, kv }, { key }) {
          const keysToRemove: any[] = [];
          processItem(
            key as Key & Item[ChildField] & string,
            groups,
            kv.ref,
            keysToRemove
          );
          return keysToRemove.map((key) => ({ key }));
        },
        target: removeItem,
      });

      return removeItemTrigger;
    },
    addItem({ fn }) {
      return addItem.prepend((params: any) => {
        const userData = fn(params);
        const itemKey = keygen(userData);
        return {
          key: itemKey,
          value: userData,
        };
      });
    },
    addItemTree<Input, RawInput = Input>({
      normalize = (item: RawInput) => item as unknown as Input,
      convertInput,
      getChilds,
    }: {
      normalize?: (input: RawInput) => Input;
      convertInput: (item: Input, childOf: Key | null) => Item;
      getChilds: (item: Input) => RawInput | RawInput[] | null | undefined;
    }) {
      function traverseTree(
        raw: RawInput,
        result: {
          key: Key;
          value: Item;
        }[],
        childOf: Key | null = null
      ) {
        const input = normalize(raw);
        const value = convertInput(input, childOf);
        const childs = getChilds(input);
        const itemKey = keygen(value);

        result.push({ key: itemKey, value });
        arrifyIterate<RawInput>(childs, (child) =>
          traverseTree(child, result, itemKey)
        );
      }
      return addItem.prepend((params: RawInput[] | RawInput) => {
        const result: {
          key: Key;
          value: Item;
        }[] = [];
        arrifyIterate(params, (item) => traverseTree(item, result));

        return result;
      });
    },
    setAll<Path extends keyof Item>(match: Path) {
      const clock = createEvent<Item[Path]>();
      sample({
        clock,
        fn: (value) =>
          ({ key: match, value } as {
            key: keyof Item;
            value: Item[keyof Item];
          }),
        target: setAll,
      });
      return clock;
    },
    setField(field) {
      const fn = (item: Item, upd: any) => ({ [field]: upd } as Partial<Item>);
      const clock = createEvent<any>();
      sample({
        clock,
        target: mapItem,
        fn: ({ key, value }) => ({ key, value, fn }),
      });
      return clock;
    },
    removeByField: (field) => removeWhen.prepend(() => ({ field })),
  };
  return listApi;
}

function arrifyIterate<T>(
  value: T[] | T | null | void,
  fn: (value: T) => void
) {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) value.forEach((item) => fn(item));
  else fn(value);
}

function filterKV<Key extends PossibleKey, Item>(
  kv: Record<Key, Item>,
  callback: (item: Item, key?: Key) => boolean
): Record<Key, Item> {
  return Object.fromEntries(
    Object.entries(kv).filter(([key, value]) =>
      callback(value as Item, key as Key)
    )
  ) as Record<Key, Item>;
}
