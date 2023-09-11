import { Event, Store } from 'effector';

export function readonly<T>(store: Store<T>): Store<T>;
export function readonly<T>(event: Event<T>): Event<T>;

export function readonly<T>(
  storeOrEvent: Store<T> | Event<T>
): Store<T> | Event<T> {
  return storeOrEvent.map((v) => v);
}
