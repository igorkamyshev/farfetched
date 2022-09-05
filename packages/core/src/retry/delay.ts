import { RetryMeta } from './type';

function linearDelay(base: number) {
  return function ({ attempt }: RetryMeta) {
    return base * attempt;
  };
}

function exponentialDelay(base: number) {
  return function ({ attempt }: RetryMeta) {
    return base ** attempt;
  };
}

export { exponentialDelay, linearDelay };
