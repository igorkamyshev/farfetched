import { createListApi } from '../keyval/core';

export interface QueryData {
  name: string;
  data: unknown;
  currentParams: unknown;
}

export const queries = createListApi<QueryData, string>({
  keygen: (q) => q.name,
});

export const addQuery = queries.addItem({ fn: (data: QueryData) => data });
export const queryDataChanged = queries.setField('data');
export const queryParamsChanged = queries.setField('currentParams');
