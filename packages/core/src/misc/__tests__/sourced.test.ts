import { allSettled, createEvent, createStore, fork } from 'effector';

import { normalizeSourced, reduceTwoArgs } from '../sourced';

describe('normalizeSourced', () => {
  test('handle simple value', async () => {
    const clock = createEvent();

    const $normalized = normalizeSourced({ field: 'static string', clock });

    const scope = fork();

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe('static string');

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe('static string');
  });

  test('handle store value', async () => {
    const clock = createEvent();

    const $field = createStore('first value');

    const $normalized = normalizeSourced({ field: $field, clock });

    const scope = fork();

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe('first value');

    await allSettled($field, { scope, params: 'Second value' });
    expect(scope.getState($normalized)).toBe('first value');

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe('Second value');
  });

  test('handle callback with source', async () => {
    const clock = createEvent<string>();

    const $source = createStore('1');

    const $normalized = normalizeSourced({
      field: { source: $source, fn: (params, source) => `${params}_${source}` },
      clock,
    });

    const scope = fork();

    await allSettled(clock, { scope, params: 'first' });

    expect(scope.getState($normalized)).toBe('first_1');

    await allSettled(clock, { scope, params: 'second' });
    expect(scope.getState($normalized)).toBe('second_1');

    await allSettled($source, { scope, params: '2' });
    expect(scope.getState($normalized)).toBe('second_1');

    await allSettled(clock, { scope, params: 'third' });
    expect(scope.getState($normalized)).toBe('third_2');
  });

  test('handle callback', async () => {
    const clock = createEvent<string>();

    const $normalized = normalizeSourced({
      field: (params) => `call_${params}`,
      clock,
    });

    const scope = fork();

    await allSettled(clock, { scope, params: 'first' });
    expect(scope.getState($normalized)).toBe('call_first');

    await allSettled(clock, { scope, params: 'second' });
    expect(scope.getState($normalized)).toBe('call_second');
  });
});

describe('reduceTwoArgs', () => {
  test('handle callback', async () => {
    const clockData = createEvent<string>();
    const clockParams = createEvent<string>();

    const $normalized = normalizeSourced(
      reduceTwoArgs({
        field: (data, params) => data + params,
        clock: { data: clockData, params: clockParams },
      })
    );

    const scope = fork();

    await allSettled(clockData, { scope, params: 'FIRST' });

    // Before clockParams call
    expect(scope.getState($normalized)).toBeNull();

    await allSettled(clockParams, { scope, params: 'params' });

    // After all clocks called
    expect(scope.getState($normalized)).toBe('FIRSTparams');

    await allSettled(clockData, { scope, params: 'SECOND' });
    await allSettled(clockParams, { scope, params: 'other' });
    expect(scope.getState($normalized)).toBe('SECONDother');
  });

  test('handle callback with source', async () => {
    const $source = createStore('source');

    const clockData = createEvent<string>();
    const clockParams = createEvent<string>();

    const $normalized = normalizeSourced(
      reduceTwoArgs({
        field: {
          source: $source,
          fn: (data, params, source) => data + params + source,
        },
        clock: { data: clockData, params: clockParams },
      })
    );

    const scope = fork();

    await allSettled(clockData, { scope, params: 'FIRST' });
    await allSettled(clockParams, { scope, params: 'params' });
    expect(scope.getState($normalized)).toBe('FIRSTparamssource');

    await allSettled($source, { scope, params: 'new source' });
    await allSettled(clockData, { scope, params: 'SECOND' });
    await allSettled(clockParams, { scope, params: 'other' });
    expect(scope.getState($normalized)).toBe('SECONDothernew source');
  });
});
