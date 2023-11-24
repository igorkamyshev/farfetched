import { attach, sample, type Effect } from 'effector';

import { type RemoteOperation } from '../remote_operation/type';
import { type Barrier } from './type';

export function applyBarrier<
  O extends RemoteOperation<any, any, any, any, any>
>(operation: O, { barrier }: { barrier: Barrier }): void {
  sample({ clock: operation.started, target: barrier.__.touch });

  sample({
    clock: operation.finished.failure,
    target: barrier.__.operationFailed,
  });

  sample({
    clock: barrier.activated,
    filter: operation.$failed,
    source: operation.__.$latestParams,
    fn: (params) => ({
      params,
      meta: { stopErrorPropagation: false, stale: false },
    }),
    target: operation.__.lowLevelAPI.startWithMeta,
  });

  const blockerSourceFx = attach({
    source: { mutex: barrier.__.$mutex, active: barrier.$active },
    async effect({ mutex }) {
      await mutex?.waitForUnlock();

      return null;
    },
  }) as any as Effect<
    { params: any },
    { result: unknown; stale: boolean } | null,
    unknown
  >;

  operation.__.lowLevelAPI.dataSources.unshift({
    name: 'barrier_blocker',
    get: blockerSourceFx,
  });
}
