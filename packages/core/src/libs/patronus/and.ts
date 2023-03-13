import { type Store } from 'effector';
import { every } from './every';

export function and(...stores: Array<Store<boolean>>): Store<boolean> {
  return every({ predicate: true, stores });
}
