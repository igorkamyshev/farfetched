import { combine, merge, sample } from 'effector';
import { every } from 'patronum';

import { postpone } from '../misc/postpone';
import { isQuery, Query } from '../query/type';
import {
  RemoteOperationData,
  RemoteOperationParams,
} from '../remote_operation/type';

/**
 * Target query will be executed after all sources queries successful end.
 *
 * Data of source queries transforms by optional `fn` and passes to target query as a params.
 */
function connectQuery<
  Sources extends Record<string, Query<any, any, any>>,
  Target extends Query<any, any, any>
>(config: {
  source: Sources;
  fn?: (sources: {
    [index in keyof Sources]: RemoteOperationData<Sources[index]>;
  }) => { params: RemoteOperationParams<Target> };
  target: Target | [...Target[]];
}): void;

/**
 * Target query will be executed after source query successful end.
 *
 * Data of source queries transforms by optional `fn` and passes to target query as a params.
 */
function connectQuery<
  Source extends Query<any, any, any>,
  Target extends Query<any, any, any>
>(config: {
  source: Source;
  fn?: (sources: RemoteOperationData<Source>) => {
    params: RemoteOperationParams<Target>;
  };
  target: Target | [...Target[]];
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
    [index in keyof Sources]: RemoteOperationData<Sources[index]>;
  }) => { params: RemoteOperationParams<Target> };
}): void {
  // Settings
  const singleParentMode = isQuery(source);

  // Participants
  const children = Array.isArray(target) ? target : [target];
  const parents = singleParentMode ? [source] : Object.values(source);
  const parentsEntries: [string, Query<any, any, any>][] = singleParentMode
    ? [['singleParent', source as Query<any, any, any>]]
    : Object.entries(source);

  // Helper untis
  const anyParentStarted = merge(parents.map((query) => query.start));
  const anyParentSuccessfullyFinished = merge(
    parents.map((query) => query.finished.success)
  );

  const $allParentsHaveData = every({
    stores: parents.map((query) => query.$data),
    predicate: (data) => data !== null,
  });

  const $allParentDataDictionary = singleParentMode
    ? source.$data
    : combine(
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
    fn(data: any) {
      return fn?.(data)?.params ?? null;
    },
    target: children.map((t) => t.start),
  });
}

export { connectQuery };
