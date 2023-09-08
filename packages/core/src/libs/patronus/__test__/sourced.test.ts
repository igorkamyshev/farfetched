import {
  allSettled,
  combine,
  createEvent,
  createStore,
  createWatch,
  fork,
  sample,
} from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { combineSourced, normalizeSourced, reduceTwoArgs } from '../sourced';

describe('normalizeSourced', () => {
  test('handle simple value', async () => {
    const $normalized = normalizeSourced({ field: 'static string' });

    const $one = combine($normalized, (normalized) => normalized('one'));
    const $two = combine($normalized, (normalized) => normalized('two'));

    const scope = fork();

    expect(scope.getState($one)).toBe('static string');
    expect(scope.getState($two)).toBe('static string');
  });

  test('handle simple nullish value', async () => {
    const $normalized = normalizeSourced({ field: false });
    const $one = combine($normalized, (normalized) => normalized('one'));
    const $two = combine($normalized, (normalized) => normalized('two'));

    const scope = fork();

    expect(scope.getState($one)).toBe(false);
    expect(scope.getState($two)).toBe(false);
  });

  test('handle null value', async () => {
    const $normalized = normalizeSourced({ field: null });
    const $one = combine($normalized, (normalized) => normalized('one'));
    const $two = combine($normalized, (normalized) => normalized('two'));

    const scope = fork();

    expect(scope.getState($one)).toBe(null);
    expect(scope.getState($two)).toBe(null);
  });

  test('handle store value', async () => {
    const $field = createStore('first value');

    const $normalized = normalizeSourced({ field: $field });

    const $one = combine($normalized, (normalized) => normalized('one'));
    const $two = combine($normalized, (normalized) => normalized('two'));

    const scope = fork();

    expect(scope.getState($one)).toBe('first value');
    expect(scope.getState($two)).toBe('first value');

    await allSettled($field, { scope, params: 'Second value' });

    expect(scope.getState($one)).toBe('Second value');
    expect(scope.getState($two)).toBe('Second value');
  });

  test('handle callback with source', async () => {
    const clock = createEvent<string>();

    const $source = createStore('1');

    const $normalized = normalizeSourced({
      field: { source: $source, fn: (params, source) => `${params}_${source}` },
    });

    const result = sample({
      clock,
      source: $normalized,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: 'first' });
    expect(resultWather).toBeCalledWith('first_1');

    await allSettled(clock, { scope, params: 'second' });
    expect(resultWather).toBeCalledWith('second_1');

    await allSettled($source, { scope, params: '2' });
    expect(resultWather).toBeCalledWith('second_1');

    await allSettled(clock, { scope, params: 'third' });
    expect(resultWather).toBeCalledWith('third_2');
  });

  test('handle callback', async () => {
    const clock = createEvent<string>();

    const $normalized = normalizeSourced({
      field: (params) => `call_${params}`,
    });

    const result = sample({
      clock,
      source: $normalized,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: 'first' });
    expect(resultWather).toBeCalledWith('call_first');

    await allSettled(clock, { scope, params: 'second' });
    expect(resultWather).toBeCalledWith('call_second');
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

    const result = sample({
      clock,
      source: $normalized,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: ['FIRST', 'params'] });
    expect(resultWather).toBeCalledWith('FIRSTparams');

    await allSettled(clock, { scope, params: ['SECOND', 'other'] });
    expect(resultWather).toBeCalledWith('SECONDother');
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

    const result = sample({
      clock,
      source: $normalized,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: ['FIRST', 'params'] });
    expect(resultWather).toBeCalledWith('FIRSTparamssource');

    await allSettled($source, { scope, params: 'new source' });
    await allSettled(clock, { scope, params: ['SECOND', 'other'] });
    expect(resultWather).toBeCalledWith('SECONDothernew source');
  });
});

describe('combienSourced', () => {
  test('supports plain values', async () => {
    const result = combineSourced({
      count: 1,
      name: 'John',
    });

    const $result = normalizeSourced({ field: result });
    const $value = combine($result, (result) => result('DO NOT MATTER'));

    const scope = fork();

    expect(scope.getState($value)).toEqual({ count: 1, name: 'John' });
  });

  test('supports stores', async () => {
    const result = combineSourced({
      count: createStore(1),
      name: createStore('John'),
    });

    const $result = normalizeSourced({ field: result });
    const $value = combine($result, (result) => result('DO NOT MATTER'));

    const scope = fork();

    expect(scope.getState($value)).toEqual({ count: 1, name: 'John' });
  });

  test('supports functions by arg', async () => {
    const clock = createEvent<string>();

    const $result = normalizeSourced({
      field: combineSourced({
        count: (val: string) => Number(val),
        name: createStore('John'),
      }),
    });

    const result = sample({
      clock,
      source: $result,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: '20' });
    expect(resultWather).toBeCalledWith({ count: 20, name: 'John' });

    await allSettled(clock, { scope, params: '30' });
    expect(resultWather).toBeCalledWith({ count: 30, name: 'John' });
  });

  test('supports function with source by arg', async () => {
    const $source = createStore(1);

    const clock = createEvent<string>();

    const $result = normalizeSourced({
      field: combineSourced({
        count: {
          source: $source,
          fn: (val: string, source: number) => Number(val) + source,
        },
        name: createStore('John'),
      }),
    });

    const result = sample({
      clock,
      source: $result,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: '20' });
    expect(resultWather).toBeCalledWith({ count: 21, name: 'John' });

    await allSettled($source, { scope, params: 2 });
    await allSettled(clock, { scope, params: '30' });
    expect(resultWather).toBeCalledWith({ count: 32, name: 'John' });
  });

  test('supports optional mapper', async () => {
    const $source = createStore(1);

    const clock = createEvent<string>();

    const $result = normalizeSourced({
      field: combineSourced(
        {
          count: {
            source: $source,
            fn: (val: string, source: number) => Number(val) + source,
          },
          name: createStore('John'),
        },
        ({ count, name }) => ({ newCount: count, newName: name })
      ),
    });

    const result = sample({
      clock,
      source: $result,
      fn: (normalized, params) => normalized(params),
    });

    const resultWather = vi.fn();

    const scope = fork();

    createWatch({ unit: result, fn: resultWather, scope });

    await allSettled(clock, { scope, params: '20' });
    expect(resultWather).toBeCalledWith({ newCount: 21, newName: 'John' });

    await allSettled($source, { scope, params: 2 });
    await allSettled(clock, { scope, params: '30' });
    expect(resultWather).toBeCalledWith({ newCount: 32, newName: 'John' });
  });
});
