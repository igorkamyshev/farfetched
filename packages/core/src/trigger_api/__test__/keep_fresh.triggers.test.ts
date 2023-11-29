import {
  allSettled,
  createEvent,
  createStore,
  createWatch,
  fork,
} from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, expect, test, vi } from 'vitest';

import { createQuery } from '../../query/create_query';
import { keepFresh } from '../keep_fresh';

describe('keepFresh, triggers as Events', () => {
  test('mark Query as stale and refresh', async () => {
    const clock = createEvent();

    const executeListener = vi.fn(async (_: void) =>
      setTimeout(1).then(() => 42)
    );

    const query = createQuery({
      handler: executeListener,
    });

    keepFresh(query, { triggers: [clock] });

    const scope = fork();

    await allSettled(query.refresh, { scope });

    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(1);

    allSettled(clock, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(2);
  });

  test('uses latest Query params', async () => {
    const clock = createEvent();

    const executeListener = vi.fn(async (params: string) =>
      setTimeout(1).then(() => 42)
    );

    const query = createQuery({
      handler: executeListener,
    });

    keepFresh(query, { triggers: [clock] });

    const scope = fork();

    await allSettled(query.refresh, { scope, params: 'original' });

    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(1);
    expect(executeListener).toBeCalledWith('original');

    allSettled(clock, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(executeListener).toBeCalledTimes(2);
    expect(executeListener).toBeCalledWith('original');
  });
});

describe('keepFresh, triggers as TriggerProtocol', () => {
  test('setup external trigger after first Query refresh', async () => {
    const setupListener = vi.fn();
    const trigger = {
      setup: createEvent(),
      teardown: createEvent(),
      fired: createEvent(),
    };

    const handler = vi.fn();

    const query = createQuery({ handler });

    keepFresh(query, { triggers: [{ '@@trigger': () => trigger }] });

    const scope = fork();

    createWatch({
      unit: trigger.setup,
      fn: setupListener,
      scope,
    });

    await allSettled(query.refresh, { scope });

    expect(setupListener).toBeCalledTimes(1);

    await allSettled(query.refresh, { scope });
    await allSettled(query.refresh, { scope });

    expect(setupListener).toBeCalledTimes(1);
  });

  test('mark Query as stale and refresh after trigger fired', async () => {
    const trigger = {
      setup: createEvent(),
      teardown: createEvent(),
      fired: createEvent(),
    };

    const handler = vi.fn();

    const query = createQuery({ handler });

    keepFresh(query, {
      triggers: [
        {
          '@@trigger': () => trigger,
        },
      ],
    });

    const scope = fork();

    await allSettled(query.refresh, { scope });

    allSettled(trigger.fired, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);

    allSettled(trigger.fired, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(3);
  });

  test('do not setup triggers for disabled query', async () => {
    const trigger = {
      setup: createEvent(),
      teardown: createEvent(),
      fired: createEvent(),
    };

    const listener = vi.fn();
    trigger.setup.watch(listener);

    const query = createQuery({
      handler: vi.fn().mockRejectedValue(new Error('cannot')),
    });

    keepFresh(query, {
      triggers: [
        {
          '@@trigger': () => trigger,
        },
      ],
    });

    const scope = fork();

    await allSettled(query.refresh, { scope });

    expect(listener).not.toBeCalled();
  });

  test('call teardown after query disabling and call start again after enabling', async () => {
    const trigger = {
      setup: createEvent(),
      teardown: createEvent(),
      fired: createEvent(),
    };

    const $enabled = createStore(true);

    const teardownListener = vi.fn();
    trigger.teardown.watch(teardownListener);

    const setupListener = vi.fn();
    trigger.setup.watch(setupListener);

    const query = createQuery({
      handler: vi.fn(),
      enabled: $enabled,
    });

    keepFresh(query, {
      triggers: [
        {
          '@@trigger': () => trigger,
        },
      ],
    });

    const scope = fork();

    await allSettled(query.refresh, { scope });

    await allSettled($enabled, { scope, params: false });

    expect(teardownListener).toBeCalled();

    await allSettled($enabled, { scope, params: true });

    // 1 initial + 1 after enabling
    expect(setupListener).toBeCalledTimes(2);
  });

  test('call teardown after config disabling and call start again after enabling', async () => {
    const trigger = {
      setup: createEvent(),
      teardown: createEvent(),
      fired: createEvent(),
    };

    const scope = fork();

    const $enabled = createStore(true);

    const teardownListener = vi.fn();

    createWatch({
      unit: trigger.teardown,
      fn: teardownListener,
      scope,
    });

    const setupListener = vi.fn();

    createWatch({
      unit: trigger.setup,
      fn: setupListener,
      scope,
    });

    const query = createQuery({
      handler: vi.fn(),
    });

    keepFresh(query, {
      enabled: $enabled,
      triggers: [
        {
          '@@trigger': () => trigger,
        },
      ],
    });

    await allSettled(query.refresh, { scope });

    await allSettled($enabled, { scope, params: false });

    expect(teardownListener).toBeCalled();

    await allSettled($enabled, { scope, params: true });

    // 1 initial + 1 after enabling
    expect(setupListener).toBeCalledTimes(2);
  });
});
