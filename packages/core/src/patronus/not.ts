import { Store } from 'effector';

export function not<T>(source: Store<T>): Store<boolean> {
  return source.map((value) => !value);
}
