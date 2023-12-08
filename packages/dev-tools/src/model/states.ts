import {
  type Scope,
  type Store,
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
      const $statusStore: Store<FetchingStatus> | null =
        (getFarfetchedLinks(operation)['$status'] as any) ?? null;

      if ($statusStore) {
        newStatus({ key: operation.id, value: getState($statusStore, scope) });

        createWatch({
          unit: $statusStore,
          scope,
          fn: (status) => {
            newStatus({ key: operation.id, value: status });
          },
        });
      }

      const $dataStore: Store<unknown> | null =
        (getFarfetchedLinks(operation)['$data'] as any) ?? null;

      if ($dataStore) {
        newData({ key: operation.id, value: getState($dataStore, scope) });

        createWatch({
          unit: $dataStore,
          scope,
          fn: (status) => {
            newData({ key: operation.id, value: status });
          },
        });
      }

      const $errorStore: Store<unknown> | null =
        (getFarfetchedLinks(operation)['$error'] as any) ?? null;

      if ($errorStore) {
        newError({ key: operation.id, value: getState($errorStore, scope) });

        createWatch({
          unit: $errorStore,
          scope,
          fn: (status) => {
            newError({ key: operation.id, value: status });
          },
        });
      }
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

function getState<T>($store: Store<T>, scope?: Scope) {
  if (scope) {
    return scope.getState($store);
  }

  return $store.getState();
}

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
