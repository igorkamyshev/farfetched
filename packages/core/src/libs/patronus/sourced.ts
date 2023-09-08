import {
  type Effect,
  type Event,
  type Store,
  type Subscription,
  attach,
  combine,
  createEffect,
  createStore,
  is,
  sample,
} from 'effector';

// -- Main case --

export type Callback<Data, Result> = (data: Data) => Result;

export type DynamicallySourcedField<Data, Result> =
  | Callback<Data, Result>
  | PartialStore<Data, Result>;

export type SourcedField<Params, Result> =
  | Result
  | Store<Result>
  | Callback<Params, Result>
  | PartialStore<Params, Result>;

export function normalizeSourced<Data, Result>(config: {
  field: SourcedField<Data, Result>;
  clock: Event<Data>;
}): PartialStore<Data, Result>;

export function normalizeSourced<Data, Result>(config: {
  field: SourcedField<Data, Result>;
  source: Store<Data>;
}): PartialStore<Data, Result>;

export function normalizeSourced<Data, Result>({
  field,
  clock,
  source,
}: {
  field: any;
  clock?: Event<Data>;
  source?: Store<Data>;
}): PartialStore<Data, Result> {
  // TODO:

  return () => ({} as any);
}

// -- Reader case --

export function createSourcedReader<Data, Result>(
  field?: SourcedField<Data, Result>
): Effect<Data, Result, unknown> {
  // TODO:
  return {} as any;
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

export type TwoArgsDynamicallySourcedField<FirstData, SecondData, Result> =
  | CallbackTwoArgs<FirstData, SecondData, Result>
  | CallbackTwoArgsWithSource<
      FirstData,
      SecondData,
      Result,
      unknown /*TODO: */
    >;

type ReducedField<FirstData, SecondData, Result> = {
  field: SourcedField<[FirstData, SecondData], Result>;
  clock: Event<[FirstData, SecondData]>;
};

export function reduceTwoArgs<FirstData, SecondData, Result>(config: {
  field: TwoArgsDynamicallySourcedField<FirstData, SecondData, Result>;
  clock: Event<[FirstData, SecondData]>;
}): ReducedField<FirstData, SecondData, Result>;

export function reduceTwoArgs<FirstData, SecondData, Result>({
  field,
  clock,
}: {
  field: any;
  clock: Event<[FirstData, SecondData]>;
}): ReducedField<FirstData, SecondData, Result> {
  return {} as any;
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

// -- Extract source

export function extractSource<S>(
  sourced: SourcedField<any, any>
): Store<unknown> | null {
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
export function combineSourced(config: any, mapper?: (v: any) => any) {
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

// -- Future --

type TSHack<T> = {
  watch(cb: (payloaad: T) => void): Subscription;
} | null;

type PartialStore<Params, Result> = (
  declaration: TSHack<Params>
) => Store<(params: Params) => Result>;

export function sourced<Params, Result, Source>(
  config:
    | Result
    | Store<Result>
    | Callback<Params, Result>
    | { source: Store<Source>; fn: (params: Params, source: Source) => Result }
): PartialStore<Params, Result> {
  let $partialStore: Store<(params: Params) => Result>;

  if (typeof config === 'function') {
    $partialStore = createStore(config as Callback<Params, Result>, {
      serialize: 'ignore',
    });
  } else if ('source' in config) {
    $partialStore = combine(
      config.source,
      (source) => (params: Params) => config.fn(params, source)
    );
  } else if (is.store(config)) {
    $partialStore = combine(config, (val) => (_params: Params) => val);
  } else {
    $partialStore = createStore((_params: Params) => config as Result, {
      serialize: 'ignore',
    });
  }

  return () => $partialStore;
}
