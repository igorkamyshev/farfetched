import { Serialize } from './type';

export function serializationForSideStore<D>(
  serialize?: Serialize<D>
): 'ignore' | undefined {
  if (serialize === 'ignore') {
    return 'ignore';
  }

  return undefined;
}
