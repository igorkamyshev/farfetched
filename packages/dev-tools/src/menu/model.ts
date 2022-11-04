import { queries } from '../kernel';
import { createSelection } from '../keyval/core';

export const allQueries = createSelection(queries, () => true);
