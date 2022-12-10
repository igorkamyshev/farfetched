import { describe, test, expect } from 'vitest';

import { exponentialDelay, linearDelay } from '../delay';

describe('linearDelay', () => {
  test.each([1, 2, 3, 4, 5, 6, 7])('use base for %p-th delay', (n) => {
    const delay = linearDelay(100);
    expect(delay({ attempt: n })).toBe(n * 100);
  });

  test('random addition should be applied', () => {
    for (let i = 0; i < 100; i++) {
      const delay = linearDelay(100, {
        randomize: { spread: 10 },
      });
      expect(delay({ attempt: 1 })).toBeLessThan(110);
      expect(delay({ attempt: 1 })).toBeGreaterThan(90);
    }
  });
});

describe('exponentialDelay', () => {
  test.each([1, 2, 3, 4, 5, 6, 7])('use base for %p-th delay', (n) => {
    const delay = exponentialDelay(100);
    expect(delay({ attempt: n })).toBe(100 ** n);
  });

  test('random addition should be applied', () => {
    for (let i = 0; i < 100; i++) {
      const delay = exponentialDelay(100, {
        randomize: { spread: 10 },
      });
      expect(delay({ attempt: 1 })).toBeLessThan(110);
      expect(delay({ attempt: 1 })).toBeGreaterThan(90);
    }
  });
});
