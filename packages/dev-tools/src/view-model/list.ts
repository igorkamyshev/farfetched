import { combine } from 'effector';

import { $operations, getFarfetchedMeta } from '../model/operations';
import { $stauses, $data, $errors } from '../model/states';

export const operationHeaders = ['Type', 'Name', 'Status', 'Data', 'Error'];

export const $operationsList = combine(
  $operations,
  $stauses,
  $data,
  $errors,
  (operations, statuses, data, errors) =>
    operations.map((operation) => {
      const meta = getFarfetchedMeta(operation);
      const status = statuses[operation.id] ?? 'unknown';
      const dataItem = data[operation.id] ?? null;
      const errorItem = errors[operation.id] ?? null;

      return [
        meta.type,
        meta.name ?? getFactoryName(operation),
        status,
        { type: 'json', value: dataItem },
        { type: 'json', value: errorItem },
      ];
    })
);

function getFactoryName(node: any) {
  return node?.region?.region?.meta?.name;
}
