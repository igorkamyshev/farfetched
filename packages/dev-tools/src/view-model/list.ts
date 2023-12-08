import { combine } from 'effector';

import { $operations, getFarfetchedMeta } from '../model/operations';

export const operationHeaders = ['Type', 'Name'];

export const $operationsList = combine($operations, (operations) =>
  operations.map((operation) => {
    const meta = getFarfetchedMeta(operation);

    return [meta.type, meta.name ?? getFactoryName(operation)];
  })
);

function getFactoryName(node: any) {
  return node?.region?.region?.meta?.name;
}
