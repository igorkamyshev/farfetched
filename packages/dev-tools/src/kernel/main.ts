import { createListApi } from '../keyval/core';

export interface QueryData {
  name: string;
  data: unknown;
}

export const queries = createListApi<QueryData, string>({
  keygen: () => `id-${Math.random().toString(36).slice(2, 10)}`,
});

export const addQuery = queries.addItem({ fn: (data: QueryData) => data });
