import { createEvent } from 'effector';

import { $search } from '../../services/filters';

export const $value = $search;

export const handleChange = createEvent<string>();

$search.on(handleChange, (_, value) => value);
