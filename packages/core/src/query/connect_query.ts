import { combine, EventPayload, merge, sample } from 'effector';
import { combineEvents } from 'patronum';

import { Query } from '../query/type';

/**
 * Target query will be executed after all sources queries successful end.
 */
function connectQuery<
  Sources extends Record<string, Query<any, any, any>>,
  Target extends Query<void, any, any>
>(config: { source: Sources; target: Target | Target[] }): void;

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
  fn: (sources: {
    [index in keyof Sources]: EventPayload<
      Sources[index]['finished']['success']
    >['data'];
  }) => { params: EventPayload<Target['start']> };
  target: Target | Target[];
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
  target: Target | Target[];
  fn?: (sources: {
    [index in keyof Sources]: EventPayload<
      Sources[index]['finished']['success']
    >['data'];
  }) => EventPayload<Target['start']>;
}): void {
  const targets = Array.isArray(target) ? target : [target];

  const $normalizedSource = combine(
    Object.entries(source).reduce(
      (prev, [key, query]) => ({ ...prev, [key]: query.$data }),
      {} as {
        [index in keyof Sources]: Sources[index]['$data'];
      }
    )
  );

  const anyStart = merge(Object.values(source).map((query) => query.start));

  sample({
    clock: anyStart,
    fn() {
      return true;
    },
    target: targets.map((t) => t.$stale),
  });

  const allLoadSuccess = combineEvents({
    events: Object.values(source).map((query) => query.finished.success),
  });

  sample({
    clock: allLoadSuccess,
    source: $normalizedSource,
    fn(data: any) {
      return fn?.(data)?.params ?? null;
    },
    target: targets.map((t) => t.start),
  });
}

export { connectQuery };
