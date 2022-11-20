import { createStore } from 'effector';

export type Serialize<Data> = NonNullable<
  Parameters<typeof createStore<Data>>[1]
>['serialize'];

export function serializationForSideStore<D>(
  serialize?: Serialize<D>
): 'ignore' | undefined {
  if (serialize === 'ignore') {
    return 'ignore';
  }

  return undefined;
}
