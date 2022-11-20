import { combine, merge, sample } from 'effector';

import { mapValues } from '../libs/lohyphen';
import { every, postpone } from '../libs/patronus';
import { isQuery, Query } from '../query/type';
import {
  RemoteOperationResult,
  RemoteOperationParams,
} from '../remote_operation/type';

type NonExtendable = {
  [K in string]: never;
};

export function connectQuery<Sources, Target extends Query<any, any, any>>(
  args: {
    source: Sources;
    target: Target | [...Target[]];
  } & (Target extends Query<infer P, any, any>
    ? P extends void
      ? NonExtendable
      : Sources extends Query<any, any, any>
      ? {
          fn: (sources: { result: RemoteOperationResult<Sources> }) => {
            params: RemoteOperationParams<Target>;
          };
        }
      : Sources extends Record<string, Query<any, any, any>>
      ? {
          fn: (sources: {
            [index in keyof Sources]: {
              result: RemoteOperationResult<Sources[index]>;
            };
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
  const parents: Array<Query<any, any, any>> = singleParentMode
    ? [source]
    : Object.values(source as any);
  const mapperFn: (args: any) => { params?: any } = args?.fn;

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
    : combine(mapValues(source as any, (query) => query.$data));

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
      const mapped = mapperFn?.(
        singleParentMode
          ? { result: data }
          : mapValues(data, (result) => ({ result }))
      );

      return mapped?.params ?? null;
    },
    target: children.map((t) => t.start),
  });
}
