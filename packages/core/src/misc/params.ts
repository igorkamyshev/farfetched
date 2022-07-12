import { createEvent, Subscription } from 'effector';

// It is used only for correct type inference
interface ParamsDeclaration<T> {
  watch(cb: (payloaad: T) => void): Subscription;
}

function declareParams<T>(): ParamsDeclaration<T> {
  return createEvent<T>();
}

export { declareParams, type ParamsDeclaration };
