import { createEvent, createStore } from 'effector';

export const tabList = [
  {
    key: 'graph',
    tab: 'Graph',
  },
  {
    key: 'list',
    tab: 'List',
  },
];

export const $activeTab = createStore(tabList[1].key);

export const tabChanged = createEvent<string>();

$activeTab.on(tabChanged, (_, key) => key);
