import { createStore, Event, is, sample, Store } from 'effector';
import { combineEvents } from 'patronum';

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

function normalizeSourced<Data, Result, Source>({
  field,
  clock,
}: {
  field: any;
  clock: Event<Data>;
}): Store<Result | null> {
  const $target = createStore<any>(null, { serialize: 'ignore' });

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

  return $target;
}

// -- Extended case --

type CallbackTwoArgs<Data, Params, Result> = (
  data: Data,
  prams: Params
) => Result;

type CallbackTwoArgsWithSource<Data, Params, Result, Source> = {
  source: Store<Source>;
  fn: (data: Data, params: Params, source: Source) => Result;
};

type TwoArgsSourcedField<Data, Params, Result, Source> =
  | CallbackTwoArgs<Data, Params, Result>
  | CallbackTwoArgsWithSource<Data, Params, Result, Source>;

type ReducedField<Data, Params, Result, Source> = {
  field: SourcedField<{ data: Data; params: Params }, Result, Source>;
  clock: Event<{ data: Data; params: Params }>;
};

function reduceTwoArgs<Data, Params, Result, Source = void>(config: {
  field: TwoArgsSourcedField<Data, Params, Result, Source>;
  clock: { data: Event<Data>; params: Event<Params> };
}): ReducedField<Data, Params, Result, Source>;

function reduceTwoArgs<Data, Params, Result, Source = void>({
  field,
  clock,
}: {
  field: any;
  clock: { data: Event<Data>; params: Event<Params> };
}): ReducedField<Data, Params, Result, Source> {
  if (typeof field === 'function') {
    const callbackField = field as CallbackTwoArgs<Data, Params, Result>;

    return {
      clock: combineEvents({ events: clock }),
      field: ({ data, params }) => callbackField(data, params),
    };
  }

  const callbackField = field as CallbackTwoArgsWithSource<
    Data,
    Params,
    Result,
    Source
  >;

  return {
    clock: combineEvents({ events: clock }),
    field: {
      source: callbackField.source,
      fn: ({ data, params }, source) => callbackField.fn(data, params, source),
    },
  };
}

// -- Exports --

export {
  type SourcedField,
  normalizeSourced,
  type TwoArgsSourcedField,
  reduceTwoArgs,
};
