import { sample } from 'effector';

import { Query } from '../../query/type';
import { isHttpError } from '../guards';

const error: unknown = {};

isHttpError({ error });

const query: Query<void, unknown, unknown> = {} as any;

sample({
  clock: query.finished.failure,
  filter: isHttpError,
});
