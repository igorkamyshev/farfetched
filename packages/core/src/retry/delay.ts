import { randomNumber } from '../misc/random';
import { RetryMeta } from './type';

interface DelayOptions {
  randomize: { spread: number };
}

const defaultOptions = {
  randomize: { spread: 0 },
};

function linearDelay(base: number, opts: DelayOptions = defaultOptions) {
  return function ({ attempt }: RetryMeta) {
    return base * attempt + randomAddition(opts);
  };
}

function exponentialDelay(base: number, opts: DelayOptions = defaultOptions) {
  return function ({ attempt }: RetryMeta) {
    return base ** attempt + randomAddition(opts);
  };
}

function randomAddition({ randomize }: DelayOptions) {
  const { spread } = randomize;

  return randomNumber({ min: -spread, max: spread });
}

export { exponentialDelay, linearDelay };
