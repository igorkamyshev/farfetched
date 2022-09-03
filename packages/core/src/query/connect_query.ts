import { combine, EventPayload, merge, sample } from 'effector';
import { every } from 'patronum';

import { postpone } from '../misc/postpone';
import { Query } from '../query/type';

/**
 * Target query will be executed after all sources queries successful end.
 */
function connectQuery<
  Sources extends Record<string, Query<any, any, any>>,
  Target extends Query<void, any, any>
>(config: { source: Sources; target: Target | Target[] }): void;

/**
 * Target query will be executed after source query successful end.
 */
function connectQuery<
  Source extends Query<void, any, any>,
  Target extends Query<void, any, any>
>(config: { source: Source; target: Target | Target[] }): void;

/**
 * Target query will be executed after all sources queries successful end.
 *
 * Data of source queries transforms by `fn` and passes to target query as a params.
 */
function connectQuery<
  Source extends Query<any, any, any>,
  Target extends Query<any, any, any>
>(_config: {
  source: Source;
  fn: (sources: EventPayload<Source['finished']['success']>['data']) => {
    params: EventPayload<Target['start']>;
  };
  target: Target | Target[];
}): void;

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
  }) => { params: EventPayload<Target['start']> };
}): void {
  // Normalize
  const children = Array.isArray(target) ? target : [target];
  const parents = Object.values(source);
  const parentsEntries = Object.entries(source);

  // Helper untis
  const anyParentStarted = merge(parents.map((query) => query.start));
  const anyParentSuccessfullyFinished = merge(
    parents.map((query) => query.finished.success)
  );

  const $allParentsHaveData = every({
    stores: parents.map((query) => query.$data),
    predicate: (data) => data !== null,
  });

  const $allParentDataDictionary = combine(
    parentsEntries.reduce(
      (prev, [key, query]) => ({ ...prev, [key]: query.$data }),
      {} as {
        [index in keyof Sources]: Sources[index]['$data'];
      }
    )
  );

  // Relations
  sample({
    clock: anyParentStarted,
    fn() {
      return true;
    },
    target: children.map((t) => t.$stale),
  });

  sample({
    clock: postpone({
      clock: anyParentSuccessfullyFinished,
      until: $allParentsHaveData,
    }),
    source: $allParentDataDictionary,
    fn(data) {
      return fn?.(data)?.params ?? null;
    },
    target: children.map((t) => t.start),
  });
}

export { connectQuery };
