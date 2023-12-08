import { combine } from 'effector';

import { $operations, getFarfetchedMeta } from '../model/operations';
import { $stauses, $data, $errors } from '../model/states';
import { $search } from './search';

export const operationHeaders = ['Type', 'Name', 'Status', 'Data', 'Error'];

export const $operationsList = combine(
  {
    operations: $operations,
    statuses: $stauses,
    data: $data,
    errors: $errors,
    search: $search,
  },
  ({ operations, statuses, data, errors, search }) =>
    operations
      .map((operation) => {
        const meta = getFarfetchedMeta(operation);
        const status = statuses[operation.id] ?? 'unknown';
        const dataItem = data[operation.id] ?? null;
        const errorItem = errors[operation.id] ?? null;

        return {
          type: meta.type,
          name: meta.name ?? getFactoryName(operation) ?? 'unnamed',
          status,
          data: dataItem,
          error: errorItem,
        };
      })
      .filter((item) => overlap(search, item.name))
      .map((item) => {
        return [
          item.type,
          item.name,
          item.status,
          { type: 'json', value: item.data },
          { type: 'json', value: item.error },
        ];
      })
);

function getFactoryName(node: any) {
  return node?.region?.region?.meta?.name;
}

function overlap(search?: string, name?: string): boolean {
  if (!search || !name) return true;

  if (search.length === 0) return true;

  const normalSearch = search.toLowerCase();
  const normalName = name.toLowerCase();

  return normalSearch.includes(normalName) || normalName.includes(normalSearch);
}
