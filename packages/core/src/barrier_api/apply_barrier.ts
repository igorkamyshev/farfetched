import { attach, sample, type Effect } from 'effector';

import { type DynamicallySourcedField } from '../libs/patronus';
import {
  type RemoteOperation,
  type RemoteOperationParams,
} from '../remote_operation/type';
import { type Barrier } from './type';

export function applyBarrier<
  O extends RemoteOperation<void, any, any, any, any>
>(operation: O, config: { barrier: Barrier }): void;

export function applyBarrier<
  O extends RemoteOperation<any, any, any, any, any>,
  ResumeParamsSource = void
>(
  operation: O,
  config: {
    barrier: Barrier;
    resumeParams?: DynamicallySourcedField<
      { params: RemoteOperationParams<O> },
      RemoteOperationParams<O>,
      ResumeParamsSource
    >;
  }
): void;

export function applyBarrier<
  O extends RemoteOperation<any, any, any, any>,
  ResumeParamsSource = void
>(
  operation: O,
  {
    barrier,
  }: {
    barrier: Barrier;
    resumeParams?: DynamicallySourcedField<
      { params: RemoteOperationParams<O> },
      RemoteOperationParams<O>,
      ResumeParamsSource
    >;
  }
): void {
  sample({ clock: operation.started, target: barrier.__.touch });

  const blockerSourceFx = attach({
    source: { mutex: barrier.__.$mutex, active: barrier.$active },
    async effect({ mutex }) {
      await mutex.waitForUnlock();

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
