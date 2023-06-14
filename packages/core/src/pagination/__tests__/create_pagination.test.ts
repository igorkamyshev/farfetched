import { allSettled, fork, createEffect } from 'effector';
import { describe, test, vi, expect } from 'vitest';

import { createPagination } from '../create_pagination';
import { Pagination } from '../type';

describe('createPagination handler', () => {
  const pagination = createPagination({
    hasNextPage: () => true,
    hasPrevPage: () => true,
    handler: () => 12,
  }) as Pagination<any, any, any, any>;

  const error = new Error('Mock error');

  test('take data from sync handler', async () => {
    const mockFn = vi.fn(({ page }) => page + 42);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toBe(43);
    expect(scope.getState(pagination.$error)).toBeNull();
  });

  test('take error from sync handler', async () => {
    const mockFn = vi.fn(() => {
      throw error;
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toEqual(error);
  });

  test('take data from async handler', async () => {
    const mockFn = vi.fn(async ({ page }) => page + 42);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toBe(43);
    expect(scope.getState(pagination.$error)).toBeNull();
  });

  test('take error from async handler', async () => {
    const mockFn = vi.fn(async () => {
      throw error;
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toEqual(error);
  });
});

describe('createPagination effect', () => {
  const pagination = createPagination({
    hasNextPage: () => true,
    hasPrevPage: () => true,
    handler: () => 12,
  }) as Pagination<any, any, any, any>;

  const error = new Error('Mock error');

  test('take data from effect', async () => {
    const mockFn = createEffect(vi.fn(({ page }) => page + 42));

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toBe(43);
    expect(scope.getState(pagination.$error)).toBeNull();
  });

  test('take error from effect', async () => {
    const mockFn = vi.fn(() => {
      throw error;
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toEqual(error);
  });
});
