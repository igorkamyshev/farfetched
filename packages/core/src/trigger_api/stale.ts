import { Event, sample } from 'effector';

import { DynamicallySourcedField, normalizeSourced } from '../libs/patronus';
import { Query } from '../query/type';

export function stale<Q extends Query<void, any, any>>(
  query: Q,
  config: { clock: Event<any> }
): void;

export function stale<
  Params,
  Q extends Query<Params, any, any, any>,
  E,
  ParamsSource = void
>(
  query: Q,
  config: {
    clock: Event<E>;
    params: DynamicallySourcedField<E, Params, ParamsSource>;
  }
): void;

export function stale<
  Params,
  Q extends Query<Params, any, any, any>,
  E,
  ParamsSource = void
>(
  query: Q,
  config: {
    clock: Event<E>;
    params?: DynamicallySourcedField<E, Params, ParamsSource>;
  }
): void {
  sample({ clock: config.clock, fn: () => true, target: query.$stale });

  sample({
    clock: config.clock,
    source: normalizeSourced({
      field: config.params ?? (() => null as any),
      clock: config.clock,
    }),
    target: query.refresh,
  });
}
