import { combine, createStore, is, Store, Subscription } from 'effector';

import { Callback, SourcedField } from './sourced';

type TSHack<T> = {
  watch(cb: (payloaad: T) => void): Subscription;
} | null;

export type PartialStore<Params, Result> = (
  declaration: TSHack<Params>
) => Store<(params: Params) => Result>;

export function sourced<Params, Result, Source>(
  config: SourcedField<Params, Result, Source>
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
