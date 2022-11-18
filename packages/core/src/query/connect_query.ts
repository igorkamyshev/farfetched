import { combine, merge, sample } from 'effector';
import { every } from 'patronum';

import { postpone } from '../misc/postpone';
import { isQuery, Query } from '../query/type';
import {
  RemoteOperationResult,
  RemoteOperationParams,
} from '../remote_operation/type';

type NonExtendable = {
  [K in string]: never;
};

function connectQuery<Sources, Target extends Query<any, any, any>>(
  args: {
    source: Sources;
    target: Target | [...Target[]];
  } & (Target extends Query<infer P, any, any>
    ? P extends void
      ? NonExtendable
      : Sources extends Query<any, any, any>
      ? {
          fn: (sources: RemoteOperationResult<Sources>) => {
            params: RemoteOperationParams<Target>;
          };
        }
      : Sources extends Record<string, Query<any, any, any>>
      ? {
          fn: (sources: {
            [index in keyof Sources]: RemoteOperationResult<Sources[index]>;
          }) => { params: RemoteOperationParams<Target> };
        }
      : NonExtendable
    : NonExtendable)
): void {
  const { source, target } = args;
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
          {}
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
      return (args as any)?.fn?.(data)?.params ?? null;
    },
    target: children.map((t) => t.start),
  });
}

export { connectQuery };
