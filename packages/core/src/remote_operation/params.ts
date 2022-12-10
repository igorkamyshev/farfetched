import { createEvent, Subscription } from 'effector';

// It is used only for correct type inference
export interface ParamsDeclaration<T> {
  watch(cb: (payloaad: T) => void): Subscription;
}

export function declareParams<T>(): ParamsDeclaration<T> {
  return createEvent<T>();
}
