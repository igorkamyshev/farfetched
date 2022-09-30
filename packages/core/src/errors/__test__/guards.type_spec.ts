import { sample } from 'effector';

import { isHttpError } from '../guards';
import { Query } from '../../query/type';

const error: unknown = {};

isHttpError({ error });

const query: Query<void, unknown, unknown> = {} as any;

sample({
  clock: query.finished.failure,
  filter: isHttpError,
});
