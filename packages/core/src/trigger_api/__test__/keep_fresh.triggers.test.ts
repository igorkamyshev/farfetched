import { allSettled, createEvent, createWatch, fork } from 'effector';
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
    const someExternalTrigger = {
      '@@trigger': { setup: createEvent(), fired: createEvent() },
    };

    const handler = vi.fn();

    const query = createQuery({ handler });

    keepFresh(query, { triggers: [someExternalTrigger] });

    const scope = fork();

    createWatch({
      unit: someExternalTrigger['@@trigger'].setup,
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
    const someExternalTrigger = {
      '@@trigger': { setup: createEvent(), fired: createEvent() },
    };

    const handler = vi.fn();

    const query = createQuery({ handler });

    keepFresh(query, { triggers: [someExternalTrigger] });

    const scope = fork();

    await allSettled(query.refresh, { scope });

    allSettled(someExternalTrigger['@@trigger'].fired, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(2);

    allSettled(someExternalTrigger['@@trigger'].fired, { scope });
    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(query.$stale)).toBeFalsy();

    expect(handler).toBeCalledTimes(3);
  });
});
