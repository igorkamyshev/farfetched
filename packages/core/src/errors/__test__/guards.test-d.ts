import { Event, sample } from 'effector';
import { describe, test, expectTypeOf } from 'vitest';

import { Query } from '../../query/type';
import { ExecutionMeta } from '../../remote_operation/type';
import { isHttpError } from '../guards';
import { HttpError } from '../type';

describe('error guards', () => {
  test('narrow type of result', () => {
    const error: unknown = {};

    expectTypeOf(isHttpError({ error })).toBeBoolean();
  });

  // TODO: impossible due to TypeScript
  test.skip('narrow type of result event', () => {
    const query: Query<void, unknown, unknown> = {} as any;

    const result = sample({
      clock: query.finished.failure,
      filter: isHttpError,
    });

    // @ts-expect-error
    expectTypeOf(result).toEqualTypeOf<
      Event<{ params: void; error: HttpError<number>; meta: ExecutionMeta }>
    >();
  });
});
