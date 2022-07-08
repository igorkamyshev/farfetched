import { combine, EventPayload, sample } from 'effector';
import { combineEvents } from 'patronum';

import { Query } from '../query/type';

/**
 * Target query will be executed after all sources queries successful end.
 */
function connectQuery<
  Sources extends Record<string, Query<any, any, any>>,
  Target extends Query<void, any, any>
>(config: { source: Sources; target: Target }): void;

/**
 * Target query will be executed after all sources queries successful end.
 *
 * Data of source queries transforms by `fn` and passes to target query as a params.
 */
function connectQuery<
  Sources extends Record<string, Query<any, any, any>>,
  Target extends Query<any, any, any>
>(_config: {
  source: Sources;
  target: Target;
  fn: (sources: {
    [index in keyof Sources]: EventPayload<Sources[index]['done']['success']>;
  }) => EventPayload<Target['start']>;
}): void;

function connectQuery<
  Sources extends Record<string, Query<any, any, any>>,
  Target extends Query<any, any, any>
>({
  source,
  target,
  fn,
}: {
  source: Sources;
  target: Target;
  fn?: (sources: {
    [index in keyof Sources]: EventPayload<Sources[index]['done']['success']>;
  }) => EventPayload<Target['start']>;
}): void {
  const $normalizedSource = combine(
    Object.entries(source).reduce(
      (prev, [key, query]) => ({ ...prev, [key]: query.$data }),
      {} as {
        [index in keyof Sources]: Sources[index]['$data'];
      }
    )
  );

  const allLoadSuccess = combineEvents({
    events: Object.values(source).map((query) => query.done.success),
  });

  sample({
    clock: allLoadSuccess,
    source: $normalizedSource,
    fn(data: any) {
      return fn?.(data) ?? null;
    },
    target: target.start,
  });
}

export { connectQuery };
