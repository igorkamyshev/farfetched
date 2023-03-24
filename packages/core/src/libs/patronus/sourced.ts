import {
  attach,
  combine,
  createEffect,
  createStore,
  Effect,
  Event,
  is,
  sample,
  Store,
} from 'effector';

// -- Main case --

export type Callback<Data, Result> = (data: Data) => Result;

export type CallbackWithSource<Data, Result, Source> = {
  source: Store<Source>;
  fn: (data: Data, source: Source) => Result;
};

export type DynamicallySourcedField<Data, Result, Source> =
  | Callback<Data, Result>
  | CallbackWithSource<Data, Result, Source>;

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
  if (clock) {
    if (field === undefined) {
      return createStore<any>(null, { serialize: 'ignore' });
    } else if (is.store(field)) {
      const $target = createStore<any>(null, { serialize: 'ignore' });

      sample({ clock, source: field as Store<Result>, target: $target });

      return $target;
    } else if (field?.source && field?.fn) {
      const $target = createStore<any>(null, { serialize: 'ignore' });

      const callbackField = field as CallbackWithSource<Data, Result, Source>;

      sample({
        clock,
        source: callbackField.source,
        fn: (source, params) => callbackField.fn(params, source),
        target: $target,
      });

      return $target;
    } else if (typeof field === 'function') {
      const $target = createStore<any>(null, { serialize: 'ignore' });

      const fn = field as Callback<Data, Result>;

      sample({ clock, fn: (c) => fn(c), target: $target });

      return $target;
    } else {
      return createStore<any>(field as Result, { serialize: 'ignore' });
    }
  }

  if (source) {
    const $source = source as Store<Data>;
    if (field === undefined) {
      return createStore<any>(null, { serialize: 'ignore' });
    } else if (is.store(field)) {
      const $storeField = field as Store<Result>;

      return $storeField.map((i) => i as Result | null);
    } else if (field?.source && field?.fn) {
      const callbackField = field as CallbackWithSource<
        Data,
        Result | null,
        Source
      >;

      return combine($source, callbackField.source, callbackField.fn);
    } else if (typeof field === 'function') {
      return $source.map(field as Callback<Data, Result | null>);
    } else {
      return createStore(field as Result | null, { serialize: 'ignore' });
    }
  }

  return createStore<any>(null, { serialize: 'ignore' });
}

// -- Reader case --

export function createSourcedReader<Data, Result, Source>(
  field?: SourcedField<Data, Result, Source>
): Effect<Data, Result, any> {
  let readFx: Effect<Data, Result, any>;

  if (field === undefined) {
    readFx = createEffect(async (_params: Data) => null as any);
  } else if (is.store(field)) {
    const $storeField = field as Store<Result>;

    readFx = attach({
      source: $storeField,
      async effect(source, _params: Data) {
        return source;
      },
    });
  } else if ((field as any).source && (field as any).fn) {
    const callbackField = field as CallbackWithSource<Data, Result, Source>;

    readFx = attach({
      source: callbackField.source,
      async effect(source, params: Data) {
        return callbackField.fn(params, source);
      },
    });
  } else if (typeof field === 'function') {
    const callbackField = field as Callback<Data, Result>;

    readFx = createEffect(async (params: Data) => callbackField(params));
  } else {
    const valueField = field as Result;

    readFx = createEffect(async (_params: Data) => valueField);
  }

  return readFx;
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

// -- Extract source

function extractSource<S>(sourced: SourcedField<any, any, S>): Store<S> | null {
  if (is.store(sourced)) {
    return sourced;
  }

  if (sourced?.source) {
    return sourced.source;
  }

  return null;
}

// -- Combine sourced

// TODO: type it https://github.com/igorkamyshev/farfetched/issues/281
function combineSourced(config: any, mapper?: (v: any) => any) {
  const megaStore: any = {};
  const megaFns: any = {};

  for (const [key, value] of Object.entries(config) as any) {
    if (is.store(value)) {
      megaStore[key] = value;
    } else if (value?.source && value?.fn) {
      megaStore[key] = value.source;
      megaFns[key] = value.fn;
    } else if (typeof value === 'function') {
      megaFns[key] = value;
    } else {
      // plain value
      megaStore[key] = value;
    }
  }

  const $megaSource = combine(megaStore);

  return {
    source: $megaSource,
    fn: (data: any, source: any) => {
      const result: any = {};
      for (const key of Object.keys(config)) {
        if (key in source) {
          result[key] = source[key];
        }
        if (key in megaFns) {
          result[key] = megaFns[key](data, source[key]);
        }
      }

      if (mapper) {
        return mapper(result);
      } else {
        return result;
      }
    },
  } as any;
}

// -- Exports --

export {
  type SourcedField,
  normalizeSourced,
  type TwoArgsDynamicallySourcedField,
  reduceTwoArgs,
  type StaticOrReactive,
  normalizeStaticOrReactive,
  extractSource,
  combineSourced,
};
