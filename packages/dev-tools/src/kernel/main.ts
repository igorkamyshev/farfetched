import { attach, Event } from 'effector';
import { createItemApi, createListApi, createSelection } from '../keyval/core';

export interface QueryData {
  name: string;
  data: unknown;
  currentParams: unknown;
  startEvent: Event<unknown>;
  pending: boolean;
  enabled: boolean;
}

export const queries = createListApi<QueryData, string>({
  keygen: (q) => q.name,
});

const allQueries = createSelection(queries, () => true);
allQueries.port.api.addConsumer(1); // TODO: remove it

export const $allQueryIds = allQueries.state.items.map((items) =>
  Object.keys(items)
);

export const $allQueries = allQueries.state.items.map((items) =>
  Object.entries(items)
);

const forceStartFx = attach({
  source: allQueries.state.items,
  effect: (queries, { key }: { key: string }) => {
    const query = queries[key];
    query.startEvent(query.currentParams);
  },
});

export const queryApi = createItemApi({
  kv: queries,
  events: {
    paramsChanged: queries.setField('currentParams'),
    dataChanged: queries.setField('data'),
    forceStart: forceStartFx.prepend((v) => v),
    pendingStateChanged: queries.setField('pending'),
    enabledStateChanged: queries.setField('enabled'),
  },
});

export const addQuery = queries.addItem({ fn: (data: QueryData) => data });
