import { DynamicallySourcedField } from '../libs/patronus';
import {
  RemoteOperation,
  RemoteOperationParams,
} from '../remote_operation/type';
import { Barrier } from './type';

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
  O extends RemoteOperation<any, any, any, any, any>,
  ResumeParamsSource = void
>(
  operation: O,
  config: {
    barrier: Barrier;
    resumtParams?: DynamicallySourcedField<
      { params: RemoteOperationParams<O> },
      RemoteOperationParams<O>,
      ResumeParamsSource
    >;
  }
): void {
  throw new Error('not implemented');
}
