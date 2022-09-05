import { combine, createStore, Event, is, sample, Store } from 'effector';

// -- Main case --

type Callback<Data, Result> = (data: Data) => Result;

type CallbackWithSource<Data, Result, Source> = {
  source: Store<Source>;
  fn: (data: Data, source: Source) => Result;
};

type SourcedField<Data, Result, Source> =
  | Result
  | Store<Result>
  | Callback<Data, Result>
  | CallbackWithSource<Data, Result, Source>;

function normalizeSourced<Data, Result, Source>(config: {
  field: SourcedField<Data, Result, Source>;
  clock: Event<Data>;
}): Store<Result>;

function normalizeSourced<Data, Result, Source>(config: {
  field: SourcedField<Data, Result, Source>;
  source: Store<Data>;
}): Store<Result>;

function normalizeSourced<Data, Result, Source>({
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
    if (!field) {
      // do nothing
    } else if (is.store(field)) {
      const $storeField = field as Store<Result>;

      sample({ clock, source: $storeField, target: $target });
    } else if (field.source && field.fn) {
      const callbackField = field as CallbackWithSource<Data, Result, Source>;

      sample({
        clock,
        source: callbackField.source,
        fn: (source, params) => callbackField.fn(params, source),
        target: $target,
      });
    } else if (typeof field === 'function') {
      const callbackField = field as Callback<Data, Result>;

      sample({ clock, fn: callbackField, target: $target });
    } else {
      const valueField = field as Result;

      sample({ clock, fn: () => valueField, target: $target });
    }
  }

  if (source) {
    const $source = source as Store<Data>;
    if (!field) {
      // do nothing
    } else if (is.store(field)) {
      const $storeField = field as Store<Result>;

      $target = $storeField;
    } else if (field.source && field.fn) {
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

// -- Extended case --

type CallbackTwoArgs<FirstData, SecondData, Result> = (
  arg1: FirstData,
  arg2: SecondData
) => Result;

type CallbackTwoArgsWithSource<FirstData, SecondData, Result, Source> = {
  source: Store<Source>;
  fn: (arg1: FirstData, arg2: SecondData, source: Source) => Result;
};

type TwoArgsDynamicallySourcedField<FirstData, SecondData, Result, Source> =
  | CallbackTwoArgs<FirstData, SecondData, Result>
  | CallbackTwoArgsWithSource<FirstData, SecondData, Result, Source>;

type ReducedField<FirstData, SecondData, Result, Source> = {
  field: SourcedField<[FirstData, SecondData], Result, Source>;
  clock: Event<[FirstData, SecondData]>;
};

function reduceTwoArgs<FirstData, SecondData, Result, Source = void>(config: {
  field: TwoArgsDynamicallySourcedField<FirstData, SecondData, Result, Source>;
  clock: Event<[FirstData, SecondData]>;
}): ReducedField<FirstData, SecondData, Result, Source>;

function reduceTwoArgs<FirstData, SecondData, Result, Source = void>({
  field,
  clock,
}: {
  field: any;
  clock: Event<[FirstData, SecondData]>;
}): ReducedField<FirstData, SecondData, Result, Source> {
  if (typeof field === 'function') {
    const callbackField = field as CallbackTwoArgs<
      FirstData,
      SecondData,
      Result
    >;

    return {
      field: ([data, params]) => callbackField(data, params),
      clock,
    };
  }

  const callbackField = field as CallbackTwoArgsWithSource<
    FirstData,
    SecondData,
    Result,
    Source
  >;

  return {
    clock,
    field: {
      source: callbackField.source,
      fn: ([data, params], source) => callbackField.fn(data, params, source),
    },
  };
}

// -- Static ot reactive case

type StaticOrReactive<T> = T | Store<Exclude<T, undefined>>;

function normalizeStaticOrReactive<T>(v: StaticOrReactive<T>): Store<T>;
function normalizeStaticOrReactive<T>(
  v?: StaticOrReactive<T>
): Store<Exclude<T, undefined> | null>;

function normalizeStaticOrReactive<T>(
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

// -- Exports --

export {
  type SourcedField,
  normalizeSourced,
  type TwoArgsDynamicallySourcedField,
  reduceTwoArgs,
  type StaticOrReactive,
  normalizeStaticOrReactive,
};
