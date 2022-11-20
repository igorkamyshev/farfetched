import {
  fork,
  serialize,
  allSettled,
  createEvent,
  createStore,
} from 'effector';
import { expect, describe, test } from 'vitest';

import { delay } from '../delay';

describe('delay', () => {
  test('throttle works in forked scope', async () => {
    const clock = createEvent();

    const $counter = createStore(0, { sid: '$counter' });

    const throttled = delay({ clock, timeout: 40 });

    $counter.on(throttled, (value) => value + 1);

    const scope = fork();

    await allSettled(clock, {
      scope,
      params: undefined,
    });

    expect(serialize(scope)).toMatchInlineSnapshot(`
    {
      "$counter": 1,
    }
  `);
  });

  test('throttle works in forked scope with target', async () => {
    const clock = createEvent();
    const target = createEvent();

    const $counter = createStore(0, { sid: '$counter' });

    delay({ clock, timeout: 40, target });

    $counter.on(target, (value) => value + 1);

    const scope = fork();

    await allSettled(clock, {
      scope,
      params: undefined,
    });

    expect(serialize(scope)).toMatchInlineSnapshot(`
    {
      "$counter": 1,
    }
  `);
  });

  test('throttle do not affect another forks', async () => {
    const $counter = createStore(0, { sid: '$counter' });

    const trigger = createEvent<number>();

    const throttled = delay({ clock: trigger, timeout: 40 });

    $counter.on(throttled, (value, payload) => value + payload);

    const scopeA = fork();
    const scopeB = fork();

    await allSettled(trigger, {
      scope: scopeA,
      params: 1,
    });

    await allSettled(trigger, {
      scope: scopeB,
      params: 100,
    });

    await allSettled(trigger, {
      scope: scopeA,
      params: 1,
    });

    await allSettled(trigger, {
      scope: scopeB,
      params: 100,
    });

    expect(serialize(scopeA)).toMatchInlineSnapshot(`
    {
      "$counter": 2,
    }
  `);

    expect(serialize(scopeB)).toMatchInlineSnapshot(`
    {
      "$counter": 200,
    }
  `);
  });

  test('throttle do not affect original store value', async () => {
    const $counter = createStore(0, { sid: '$counter' });
    const trigger = createEvent<number>();

    const throttled = delay({ clock: trigger, timeout: 40 });

    $counter.on(throttled, (value, payload) => value + payload);

    const scope = fork();

    await allSettled(trigger, {
      scope,
      params: 1,
    });

    await allSettled(trigger, {
      scope,
      params: 1,
    });

    expect(serialize(scope)).toMatchInlineSnapshot(`
    {
      "$counter": 2,
    }
  `);

    expect($counter.getState()).toMatchInlineSnapshot(`0`);
  });
});
