import { combine, createEvent, createStore } from 'effector';

import { $all, $usedStoreIds } from '../storage';

const $initialStates = combine(
  { all: $all, usedStoreIds: $usedStoreIds },
  ({ all, usedStoreIds }) =>
    all
      .filter(({ meta }) => usedStoreIds.includes(meta['unitId'] as string))
      .reduce(
        (acc, { meta }) => ({
          ...acc,
          [meta['unitId'] as string]: meta['defaultState'],
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
