import { allSettled, createEvent, createStore, fork } from 'effector';
import { describe, test, expect } from 'vitest';

import { normalizeSourced, reduceTwoArgs } from '../sourced';

describe('normalizeSourced (with clock)', () => {
  test('handle simple value', async () => {
    const clock = createEvent();

    const $normalized = normalizeSourced({ field: 'static string', clock });

    const scope = fork();

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe('static string');

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe('static string');
  });

  test('handle simple nullish value', async () => {
    const clock = createEvent();

    const $normalized = normalizeSourced({ field: false, clock });

    const scope = fork();

    await allSettled(clock, { scope });

    expect(scope.getState($normalized)).toBe(false);
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

describe('normalizeSourced (with source)', () => {
  test('handle simple value', async () => {
    const $source = createStore<string>('fdsfd');

    const $normalized = normalizeSourced({
      field: 'static string',
      source: $source,
    });

    const scope = fork();

    expect(scope.getState($normalized)).toBe('static string');

    await allSettled($source, { scope, params: 'tretre' });

    expect(scope.getState($normalized)).toBe('static string');
  });

  test('handle simple nullish value', async () => {
    const $source = createStore<string>('fdsfd');

    const $normalized = normalizeSourced({
      field: false,
      source: $source,
    });

    const scope = fork();

    expect(scope.getState($normalized)).toBe(false);

    await allSettled($source, { scope, params: 'tretre' });

    expect(scope.getState($normalized)).toBe(false);
  });

  test('handle store value', async () => {
    const $source = createStore('');

    const $field = createStore('first value');

    const $normalized = normalizeSourced({ field: $field, source: $source });

    const scope = fork();

    expect(scope.getState($normalized)).toBe('first value');

    await allSettled($source, { scope, params: 'fdsfgsdgds' });

    await allSettled($field, { scope, params: 'Second value' });
  });

  test('handle callback with source', async () => {
    const $source = createStore('first');

    const $externalSource = createStore('1');

    const $normalized = normalizeSourced({
      field: {
        source: $externalSource,
        fn: (params, source) => `${params}_${source}`,
      },
      source: $source,
    });

    const scope = fork();

    expect(scope.getState($normalized)).toBe('first_1');

    await allSettled($source, { scope, params: 'second' });
    expect(scope.getState($normalized)).toBe('second_1');

    await allSettled($externalSource, { scope, params: '2' });
    expect(scope.getState($normalized)).toBe('second_2');

    await allSettled($source, { scope, params: 'third' });
    expect(scope.getState($normalized)).toBe('third_2');
  });

  test('handle callback', async () => {
    const $source = createStore('first');

    const $normalized = normalizeSourced({
      field: (params) => `call_${params}`,
      source: $source,
    });

    const scope = fork();

    expect(scope.getState($normalized)).toBe('call_first');

    await allSettled($source, { scope, params: 'second' });
    expect(scope.getState($normalized)).toBe('call_second');
  });
});

describe('reduceTwoArgs', () => {
  test('handle callback', async () => {
    const clock = createEvent<[string, string]>();

    const $normalized = normalizeSourced(
      reduceTwoArgs({
        field: (data, params) => data + params,
        clock,
      })
    );

    const scope = fork();

    expect(scope.getState($normalized)).toBeNull();
    await allSettled(clock, { scope, params: ['FIRST', 'params'] });
    expect(scope.getState($normalized)).toBe('FIRSTparams');

    await allSettled(clock, { scope, params: ['SECOND', 'other'] });
    expect(scope.getState($normalized)).toBe('SECONDother');
  });

  test('handle callback with source', async () => {
    const $source = createStore('source');

    const clock = createEvent<[string, string]>();

    const $normalized = normalizeSourced(
      reduceTwoArgs({
        field: {
          source: $source,
          fn: (data, params, source) => data + params + source,
        },
        clock,
      })
    );

    const scope = fork();

    await allSettled(clock, { scope, params: ['FIRST', 'params'] });
    expect(scope.getState($normalized)).toBe('FIRSTparamssource');

    await allSettled($source, { scope, params: 'new source' });
    await allSettled(clock, { scope, params: ['SECOND', 'other'] });
    expect(scope.getState($normalized)).toBe('SECONDothernew source');
  });
});
