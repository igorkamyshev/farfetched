import { combine, createStore, Event, merge, sample } from 'effector';

import { mapValues, zipObject } from '../libs/lohyphen';
import { every, postpone } from '../libs/patronus';
import { isQuery, Query } from '../query/type';
import {
  RemoteOperationResult,
  RemoteOperationParams,
} from '../remote_operation/type';

type NonExtendable = {
  [K in string]: never;
};

export function connectQuery<Sources, Target extends Query<any, any, any, any>>(
  args: {
    source: Sources;
    target: Target | [...Target[]];
  } & (Target extends Query<infer P, any, any, any>
    ? P extends void
      ? { fn?: undefined; filter?: () => boolean }
      : Sources extends Query<any, any, any>
      ? {
          fn: (sources: {
            result: RemoteOperationResult<Sources>;
            params: RemoteOperationParams<Sources>;
          }) => {
            params: RemoteOperationParams<Target>;
          };
          filter?: (sources: {
            result: RemoteOperationResult<Sources>;
            params: RemoteOperationParams<Sources>;
          }) => boolean;
        }
      : Sources extends Record<string, Query<any, any, any>>
      ? {
          fn: (sources: {
            [index in keyof Sources]: {
              result: RemoteOperationResult<Sources[index]>;
              params: RemoteOperationParams<Sources[index]>;
            };
          }) => { params: RemoteOperationParams<Target> };
          filter?: (sources: {
            [index in keyof Sources]: {
              result: RemoteOperationResult<Sources[index]>;
              params: RemoteOperationParams<Sources[index]>;
            };
          }) => boolean;
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
  const mapperFn = args?.fn as (args: any) => { params?: any };
  const filterFn = args?.filter as (args: any) => boolean;

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

  const $allParentParamsDictionary = createStore<any>(null, {
    serialize: 'ignore',
    name: 'ff.$allParentParamsDictionary',
    sid: 'ff.$allParentParamsDictionary',
    skipVoid: false,
  });
  if (singleParentMode) {
    sample({
      clock: source.finished.success,
      fn: ({ params }) => params,
      target: $allParentParamsDictionary,
    });
  } else {
    for (const [parentName, parentFinishedSuccess] of Object.entries(
      mapValues(source as any, (query) => query.finished.success)
    )) {
      sample({
        clock: parentFinishedSuccess as Event<{ params: any }>,
        source: $allParentParamsDictionary,
        fn: (latestParams, { params }) => ({
          ...latestParams,
          [parentName]: params,
        }),
        target: $allParentParamsDictionary,
      });
    }
  }

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
    source: {
      data: $allParentDataDictionary,
      params: $allParentParamsDictionary,
    },
    filter({ data, params }) {
      return (
        filterFn?.(
          singleParentMode
            ? { result: data, params }
            : zipObject({ result: data, params })
        ) ?? true
      );
    },
    fn({ data, params }) {
      const mapped = mapperFn?.(
        singleParentMode
          ? { result: data, params }
          : zipObject({ result: data, params })
      );

      return mapped?.params;
    },
    target: children.map((t) => t.start),
  });
}
