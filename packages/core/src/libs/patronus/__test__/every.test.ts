import { fork, allSettled, createEvent, createStore } from 'effector';
import { describe, test, expect } from 'vitest';

import { every } from '../every';

describe('every', () => {
  test('allow predicate to use store', async () => {
    const setSource = createEvent<boolean>();
    const setPredicate = createEvent<boolean>();

    const $predicate = createStore(false).on(setPredicate, (_, value) => value);

    const $first = createStore(true);
    const $second = createStore(false).on(setSource, (_, value) => value);
    const $third = createStore(true);

    const $result = every({
      predicate: $predicate,
      stores: [$first, $second, $third],
    });

    const scope = fork();

    expect(scope.getState($result)).toBeFalsy();

    await allSettled(setSource, { scope, params: true });
    expect(scope.getState($result)).toBeFalsy();

    await allSettled(setPredicate, { scope, params: true });
    expect(scope.getState($result)).toBeTruthy();

    await allSettled(setSource, { scope, params: false });
    expect(scope.getState($result)).toBeFalsy();
  });

  test('allow predicate to use store in short form', async () => {
    const setSource = createEvent<boolean>();
    const setPredicate = createEvent<boolean>();

    const $predicate = createStore(false).on(setPredicate, (_, value) => value);

    const $first = createStore(true);
    const $second = createStore(false).on(setSource, (_, value) => value);
    const $third = createStore(true);

    const $result = every([$first, $second, $third], $predicate);

    const scope = fork();

    expect(scope.getState($result)).toBeFalsy();

    await allSettled(setSource, { scope, params: true });
    expect(scope.getState($result)).toBeFalsy();

    await allSettled(setPredicate, { scope, params: true });
    expect(scope.getState($result)).toBeTruthy();

    await allSettled(setSource, { scope, params: false });
    expect(scope.getState($result)).toBeFalsy();
  });
});
