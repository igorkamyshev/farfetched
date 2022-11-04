import { queries } from '../kernel';
import { createSelection } from '../keyval/core';

const allQueries = createSelection(queries, () => true);

export const $menuItems = allQueries.state.items.map((items) =>
  Object.entries(items)
);

allQueries.port.api.addConsumer(1);
