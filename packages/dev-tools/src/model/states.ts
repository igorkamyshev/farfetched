import {
  type Scope,
  type Store,
  type EventCallable,
  createEffect,
  createStore,
  createWatch,
  sample,
  createEvent,
} from 'effector';
import { type FetchingStatus } from '@farfetched/core';

import {
  type FarfetchedDeclaration,
  getFarfetchedLinks,
  $operations,
} from './operations';
import { appStarted } from './init';

export const [$stauses, newStatus] = createKv();
export const [$data, newData] = createKv();
export const [$errors, newError] = createKv();

const startStatesWatchFx = createEffect(
  ({
    scope,
    operations,
  }: {
    scope?: Scope;
    operations: FarfetchedDeclaration[];
  }) => {
    for (const operation of operations) {
      listenUpdates(
        operation.id,
        getFarfetchedLinks(operation)['$status'] as any,
        newStatus,
        scope
      );

      listenUpdates(
        operation.id,
        getFarfetchedLinks(operation)['$data'] as any,
        newData,
        scope
      );

      listenUpdates(
        operation.id,
        getFarfetchedLinks(operation)['$error'] as any,
        newError,
        scope
      );
    }
  }
);

sample({
  clock: appStarted,
  source: $operations,
  fn: (operations, { scope }) => ({ operations, scope }),
  target: startStatesWatchFx,
});

// -- utils
function createKv<T>() {
  const $store = createStore<Record<string, T>>({});
  const set = createEvent<{ key: string; value: T }>();

  sample({
    clock: set,
    source: $store,
    fn: (store, { key, value }) => ({ ...store, [key]: value }),
    target: $store,
  });

  return [$store, set] as const;
}

function listenUpdates<T>(
  id: string,
  $store: Store<T> | null,
  listener: EventCallable<{ key: string; value: T }>,
  scope?: Scope
) {
  if (!$store) {
    return;
  }

  listener({ key: id, value: getState($store, scope) });

  createWatch({
    unit: $store,
    scope,
    fn: (status) => {
      listener({ key: id, value: status });
    },
  });
}

function getState<T>($store: Store<T>, scope?: Scope) {
  if (scope) {
    return scope.getState($store);
  }

  return $store.getState();
}
