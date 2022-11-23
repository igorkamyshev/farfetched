import { allSettled, createEvent, createStore, fork } from 'effector';
import { describe, test, expect } from 'vitest';

import { not } from '../not';

describe('not', () => {
  test('correctly updates when value changes', async () => {
    const changeToFalse = createEvent();
    const $exists = createStore(true).on(changeToFalse, () => false);
    const $absent = not($exists);

    const scope = fork();
    expect(scope.getState($absent)).toBe(false);

    await allSettled(changeToFalse, { scope });
    expect(scope.getState($absent)).toBe(true);
  });
});
