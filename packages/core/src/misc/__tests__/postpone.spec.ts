import { allSettled, createEvent, createStore, fork } from 'effector';
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
});
