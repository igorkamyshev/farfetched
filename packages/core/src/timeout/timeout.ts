import {
  delay,
  normalizeSourced,
  normalizeStaticOrReactive,
  type DynamicallySourcedField,
  type SourcedField,
  type StaticOrReactive,
} from '../libs/patronus';
import { type RemoteOperation } from '../remote_operation/type';
import { type Time, parseTime } from '../libs/date-nfs';

export function timeout<Q extends RemoteOperation<any, any, any, any>>(
  operation: Q,
  config: { after: StaticOrReactive<Time> }
): void {
  // ok
}
