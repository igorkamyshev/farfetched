import { combine, createEvent, createStore } from 'effector';

import { $all, $usedStoreIds } from '../storage';

const $initialStates = combine(
  { all: $all, usedStoreIds: $usedStoreIds },
  ({ all, usedStoreIds }) =>
    all
      .filter((i) => usedStoreIds.includes(i.meta['unitId']))
      .reduce(
        (acc, declaration) => ({
          ...acc,
          [declaration.meta['unitId'] as string]:
            declaration.meta['defaultState'],
        }),
        {} as Record<string, unknown>
      )
);

export const newState = createEvent<{ id: string; value: unknown }>();

const $updatedStates = createStore<Record<string, unknown>>({}).on(
  newState,
  (old, { id, value }) => ({ ...old, [id]: value })
);

export const $states = combine(
  { initial: $initialStates, updated: $updatedStates },
  ({ initial, updated }) => ({ ...initial, ...updated })
);

$updatedStates.watch(console.log);
