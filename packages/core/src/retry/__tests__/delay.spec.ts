import { exponentialDelay, linearDelay } from '../delay';

describe('linearDelay', () => {
  test.each([1, 2, 3, 4, 5, 6, 7])('use base for %p-th delay', (n) => {
    const delay = linearDelay(100);
    expect(delay({ attempt: n })).toBe(n * 100);
  });
});

describe('exponentialDelay', () => {
  test.each([1, 2, 3, 4, 5, 6, 7])('use base for %p-th delay', (n) => {
    const delay = exponentialDelay(100);
    expect(delay({ attempt: n })).toBe(100 ** n);
  });
});
