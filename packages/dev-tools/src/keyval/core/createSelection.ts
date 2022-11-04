import {
  combine,
  createStore,
  createEvent,
  Event,
  sample,
  split,
} from 'effector';

import { forIn } from './forIn';
import { filterObj } from './filterObj';
import { areObjectsDifferent } from './changeDetection';
import type {
  ListApi,
  SwitchSelection,
  Selection,
  PossibleKey,
  SelectionItem,
} from './types';
import { createConsumerPort, getConsumerId } from './consumerPort';

export function createSwitch<
  Shape extends { [k: string]: Selection<any, any> }
>({
  cases,
  initialCase,
}: {
  cases: Shape;
  initialCase: keyof Shape;
}): SwitchSelection<Shape> {
  type ShapeCase = keyof Shape;
  type ShapeItem = SelectionItem<SwitchSelection<Shape>>;

  const port = createConsumerPort();
  const $currentCase = createStore(initialCase);
  const caseApi = {} as { [K in ShapeCase]: Event<void> };
  const selectionActivation = createEvent<ShapeCase>();

  forIn(cases, (selection, field) => {
    const activator = createEvent<void>();
    $currentCase.on(activator, () => field);
    caseApi[field] = activator;
    const consumerId = getConsumerId(selection.port);
    const activateCase = selection.port.api.addConsumer.prepend(
      () => consumerId
    );
    const deactivateCase = selection.port.api.removeConsumer.prepend(
      () => consumerId
    );
    split({
      source: selectionActivation,
      match: (currentCase) =>
        currentCase === field ? 'activate' : 'deactivate',
      cases: {
        activate: activateCase,
        deactivate: deactivateCase,
      } as const,
    });
    sample({
      clock: port.api.deactivated,
      target: deactivateCase,
    });
  });
  const caseNames = Object.keys(cases) as Array<ShapeCase>;
  const caseValues = Object.values(cases);

  const $items = createStore({} as Record<any, ShapeItem>);
  const $size = createStore(0);

  sample({
    clock: [$currentCase, port.api.activated],
    source: $currentCase,
    filter: port.state.active,
    target: selectionActivation,
  });
  sample({
    source: combine([
      $currentCase,
      ...caseValues.map(({ state }) => state.items),
    ]),
    filter: port.state.active,
    target: $items,
    fn: ([currentCase, ...lists]) => lists[caseNames.indexOf(currentCase)],
  });
  sample({
    source: combine([
      $currentCase,
      ...caseValues.map(({ state }) => state.size),
    ]),
    filter: port.state.active,
    target: $size,
    fn: ([currentCase, ...lists]) => lists[caseNames.indexOf(currentCase)],
  });

  return {
    state: {
      items: $items,
      size: $size,
      currentCase: $currentCase,
    },
    api: caseApi,
    cases,
    port,
  };
}

export function createSelection<
  Item,
  Key extends PossibleKey,
  SelectedItem extends Item
>(
  kv: ListApi<Item, Key>,
  fn: ((item: Item) => item is SelectedItem) | ((item: Item) => boolean)
): Selection<SelectedItem, any> {
  const port = createConsumerPort();
  const $items = createStore<Record<Key, SelectedItem>>(
    {} as Record<Key, SelectedItem>,
    {
      updateFilter: areObjectsDifferent,
    }
  );
  const $size = $items.map((items) => Object.keys(items).length);

  sample({
    clock: [kv.state.store, port.api.activated],
    source: kv.state.store,
    filter: port.state.active,
    target: $items,
    fn: (kv) => filterObj(kv.ref, fn),
  });

  return {
    state: {
      items: $items,
      size: $size,
    },
    port,
  };
}
