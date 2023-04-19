import {
  allSettled,
  createEvent,
  createStore,
  createWatch,
  fork,
} from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { postpone } from '../postpone';

describe('postpone', () => {
  test('fire event immediately if until is true', async () => {
    const clock = createEvent();

    const triggered = postpone({ clock, until: createStore<boolean>(true) });

    const mock = vi.fn();
    triggered.watch(mock);

    const scope = fork();

    await allSettled(clock, { scope });

    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('do NOT fire event immediately if until is false', async () => {
    const clock = createEvent();

    const triggered = postpone({ clock, until: createStore<boolean>(false) });

    const mock = vi.fn();
    triggered.watch(mock);

    const scope = fork();

    await allSettled(clock, { scope });

    expect(mock).toHaveBeenCalledTimes(0);
  });

  test('fire event after until become true', async () => {
    const clock = createEvent();
    const $until = createStore<boolean>(false);

    const triggered = postpone({ clock, until: $until });

    const mock = vi.fn();
    triggered.watch(mock);

    const scope = fork();

    await allSettled(clock, { scope });
    expect(mock).toHaveBeenCalledTimes(0);

    await allSettled($until, { scope, params: true });
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('DO NOT fire event if clock is not triggered and until is true', async () => {
    const clock = createEvent();

    const triggered = postpone({ clock, until: createStore<boolean>(true) });

    const mock = vi.fn();
    triggered.watch(mock);

    expect(mock).toHaveBeenCalledTimes(0);
  });

  test('DO NOT fire event if clock is not triggered and until become true', async () => {
    const clock = createEvent();
    const $until = createStore<boolean>(false);

    const triggered = postpone({ clock, until: $until });

    const mock = vi.fn();
    triggered.watch(mock);

    const scope = fork();

    await allSettled($until, { scope, params: true });
    expect(mock).toHaveBeenCalledTimes(0);
  });

  test('DO NOT re-fire already fired event while change until value', async () => {
    const $until = createStore(true);

    const clock = createEvent();

    const target = postpone({ clock, until: $until });

    const scope = fork();

    const listener = vi.fn();

    createWatch({ unit: target, fn: listener, scope });

    await allSettled(clock, { scope });

    expect(listener).toHaveBeenCalledTimes(1);

    await allSettled($until, { scope, params: false });
    await allSettled($until, { scope, params: true });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('DO NOT re-fire already fired event', async () => {
    const $until = createStore(false);

    const clock = createEvent<string>();

    const target = postpone({ clock, until: $until });

    const scope = fork();

    const listener = vi.fn();

    createWatch({ unit: target, fn: listener, scope });

    await allSettled(clock, { scope, params: 'first' });
    await allSettled($until, { scope, params: true });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('first');
    await allSettled($until, { scope, params: false });

    await allSettled(clock, { scope, params: 'second' });
    await allSettled($until, { scope, params: true });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith('second');
  });
});
