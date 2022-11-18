import { combine, createStore, Event, is, sample, Store } from 'effector';

// -- Main case --

type Callback<Data, Result> = (data: Data) => Result;

type CallbackWithSource<Data, Result, Source> = {
  source: Store<Source>;
  fn: (data: Data, source: Source) => Result;
};

export type DynamicallySourcedField<Data, Result, Source> =
  | Callback<Data, Result>
  | CallbackWithSource<Data, Result, Source>;

export type SourcedField<Data, Result, Source> =
  | Result
  | Store<Result>
  | Callback<Data, Result>
  | CallbackWithSource<Data, Result, Source>;

export function normalizeSourced<Data, Result, Source>(config: {
  field: SourcedField<Data, Result, Source>;
  clock: Event<Data>;
}): Store<Result>;

export function normalizeSourced<Data, Result, Source>(config: {
  field: SourcedField<Data, Result, Source>;
  source: Store<Data>;
}): Store<Result>;

export function normalizeSourced<Data, Result, Source>({
  field,
  clock,
  source,
}: {
  field: any;
  clock?: Event<Data>;
  source?: Store<Data>;
}): Store<Result | null> {
  let $target = createStore<any>(null, { serialize: 'ignore' });

  if (clock) {
    if (field === undefined) {
      // do nothing
    } else if (is.store(field)) {
      const $storeField = field as Store<Result>;

      sample({ clock, source: $storeField, target: $target });
    } else if (field?.source && field?.fn) {
      const callbackField = field as CallbackWithSource<Data, Result, Source>;

      sample({
        clock,
        source: callbackField.source,
        fn: (source, params) => callbackField.fn(params, source),
        target: $target,
      });
    } else if (typeof field === 'function') {
      const callbackField = field as Callback<Data, Result>;

      sample({ clock, fn: (data) => callbackField(data), target: $target });
    } else {
      const valueField = field as Result;

      sample({ clock, fn: () => valueField, target: $target });
    }
  }

  if (source) {
    const $source = source as Store<Data>;
    if (field === undefined) {
      // do nothing
    } else if (is.store(field)) {
      const $storeField = field as Store<Result>;

      $target = $storeField;
    } else if (field?.source && field?.fn) {
      const callbackField = field as CallbackWithSource<Data, Result, Source>;

      $target = combine($source, callbackField.source, callbackField.fn);
    } else if (typeof field === 'function') {
      const callbackField = field as Callback<Data, Result>;

      $target = $source.map(callbackField);
    } else {
      const valueField = field as Result;

      $target = createStore(valueField, { serialize: 'ignore' });
    }
  }

  return $target;
}

// -- Static ot reactive case

export type StaticOrReactive<T> = T | Store<Exclude<T, undefined>>;

export function normalizeStaticOrReactive<T>(v: StaticOrReactive<T>): Store<T>;
export function normalizeStaticOrReactive<T>(
  v?: StaticOrReactive<T>
): Store<Exclude<T, undefined> | null>;

export function normalizeStaticOrReactive<T>(
  v?: StaticOrReactive<T>
): Store<Exclude<T, undefined> | null> {
  if (!v) {
    return createStore<Exclude<T, undefined> | null>(null, {
      serialize: 'ignore',
    });
  }

  if (is.store(v)) {
    return v;
  }

  return createStore<Exclude<T, undefined> | null>(v as Exclude<T, undefined>, {
    serialize: 'ignore',
  });
}
