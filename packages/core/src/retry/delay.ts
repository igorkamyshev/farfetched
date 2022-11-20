import { randomNumber } from '../libs/lohyphen';
import { RetryMeta } from './type';

interface DelayOptions {
  randomize: { spread: number };
}

const defaultOptions = {
  randomize: { spread: 0 },
};

export function linearDelay(base: number, opts: DelayOptions = defaultOptions) {
  return function ({ attempt }: RetryMeta) {
    return base * attempt + randomAddition(opts);
  };
}

export function exponentialDelay(
  base: number,
  opts: DelayOptions = defaultOptions
) {
  return function ({ attempt }: RetryMeta) {
    return base ** attempt + randomAddition(opts);
  };
}

function randomAddition({ randomize }: DelayOptions) {
  const { spread } = randomize;

  return randomNumber({ min: -spread, max: spread });
}
