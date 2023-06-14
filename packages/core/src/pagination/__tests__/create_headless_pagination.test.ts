import { allSettled, createStore, fork } from 'effector';
import { vi, describe, test, expect } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import {
  HeadlessPaginationFactoryConfig,
  createHeadlessPagination,
} from '../create_headless_pagination';
import { watchRemoteOperation } from '@farfetched/test-utils';
import { isPagination } from '../type';
import { invalidDataError } from '../../errors/create_error';

const baseConfig: HeadlessPaginationFactoryConfig<
  any,
  any,
  any,
  any,
  any,
  any
> = {
  contract: unknownContract,
  mapData: ({ result }) => result,
  hasNextPage: () => true,
  hasPrevPage: () => true,
};

describe('createHeadlessPagination simple', () => {
  const pagination = createHeadlessPagination(baseConfig);

  test('return pagination object', async () => {
    expect(isPagination(pagination)).toBeTruthy();
  });

  test('start trigger executeFx', async () => {
    const mockFn = vi.fn();

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  test('finished.success called on success', async () => {
    const mockFn = vi.fn(() => 42);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    await allSettled(pagination.start, { scope, params: { page: 42 } });

    expect(listeners.onSuccess).toHaveBeenCalledTimes(1);
    expect(listeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 42 },
        result: 42,
      })
    );

    expect(listeners.onFailure).not.toHaveBeenCalled();
    expect(listeners.onSkip).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 42 },
      })
    );

    expect(scope.getState(pagination.$status)).toBe('done');
    expect(scope.getState(pagination.$data)).toBe(42);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(42);
  });

  test('finished.failure called on fail', async () => {
    const mockFn = vi.fn(() => {
      throw new Error('Mock error');
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    await allSettled(pagination.start, { scope, params: { page: 42 } });

    expect(listeners.onFailure).toHaveBeenCalledTimes(1);
    expect(listeners.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 42 },
        error: new Error('Mock error'),
      })
    );

    expect(listeners.onSuccess).not.toHaveBeenCalled();
    expect(listeners.onSkip).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 42 },
      })
    );

    expect(scope.getState(pagination.$status)).toBe('fail');
    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toEqual(new Error('Mock error'));
    expect(scope.getState(pagination.$page)).toBe(0);
  });

  test('finished.skip called if pagination disabled', async () => {
    const disabledPagination = createHeadlessPagination({
      ...baseConfig,
      enabled: false,
    });

    const mockFn = vi.fn();

    const scope = fork({
      handlers: [[disabledPagination.__.executeFx, mockFn]],
    });

    const { listeners } = watchRemoteOperation(disabledPagination, scope);

    await allSettled(disabledPagination.start, { scope, params: { page: 42 } });

    expect(listeners.onSkip).toHaveBeenCalledTimes(1);
    expect(listeners.onSkip).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 42 },
      })
    );

    expect(listeners.onSuccess).not.toHaveBeenCalled();
    expect(listeners.onFailure).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 42 },
      })
    );

    expect(scope.getState(pagination.$status)).toBe('initial');
    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(0);
  });

  test('re-execute', async () => {
    const mockFn = vi.fn();

    const scope = fork({
      handlers: [
        [
          pagination.__.executeFx,
          mockFn
            .mockResolvedValueOnce(42)
            .mockResolvedValueOnce(411)
            .mockRejectedValueOnce(new Error('Mock error')),
        ],
      ],
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });

    expect(scope.getState(pagination.$data)).toBe(42);
    expect(scope.getState(pagination.$error)).toBeNull();

    await allSettled(pagination.start, { scope, params: { page: 1 } });

    expect(scope.getState(pagination.$data)).toBe(411);
    expect(scope.getState(pagination.$error)).toBeNull();

    await allSettled(pagination.start, { scope, params: { page: 1 } });

    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toEqual(new Error('Mock error'));
  });

  test('reset drop all', async () => {
    const mockFn = vi.fn(({ page }) => page);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { params: { page: 1 }, scope });
    await allSettled(pagination.reset, { scope });

    expect(scope.getState(pagination.$data)).toBeNull();
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(0);
    expect(scope.getState(pagination.__.$latestParams)).toBeNull();
  });

  test("receive next page on call 'next'", async () => {
    const mockFn = vi.fn(({ page }) => page);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { params: { page: 1 }, scope });

    expect(scope.getState(pagination.$data)).toBe(1);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(1);

    await allSettled(pagination.next, { scope });

    expect(scope.getState(pagination.$data)).toBe(2);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(2);
  });

  test('finished.skip if there is not next page', async () => {
    const pagination = createHeadlessPagination({
      ...baseConfig,
      hasNextPage: vi.fn(() => false),
    });
    const mockFn = vi.fn(({ page }) => page);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    await allSettled(pagination.start, { params: { page: 1 }, scope });

    expect(scope.getState(pagination.$data)).toBe(1);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(1);

    await allSettled(pagination.next, { scope });

    expect(scope.getState(pagination.$data)).toBe(1);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(1);

    expect(mockFn).toHaveBeenCalledTimes(1);

    expect(listeners.onSkip).toHaveBeenCalledTimes(1);
    expect(listeners.onSkip).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 2 },
      })
    );
  });

  test("receive prev page on call 'prev'", async () => {
    const mockFn = vi.fn(({ page }) => page);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { params: { page: 2 }, scope });

    expect(scope.getState(pagination.$data)).toBe(2);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(2);

    await allSettled(pagination.prev, { scope });

    expect(scope.getState(pagination.$data)).toBe(1);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(1);
  });

  test('finished.skip if there is not prev page', async () => {
    const pagination = createHeadlessPagination({
      ...baseConfig,
      hasPrevPage: vi.fn(() => false),
    });
    const mockFn = vi.fn(({ page }) => page);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    await allSettled(pagination.start, { params: { page: 1 }, scope });
    await allSettled(pagination.prev, { scope });

    expect(scope.getState(pagination.$data)).toBe(1);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(1);

    expect(mockFn).toHaveBeenCalledTimes(1);

    expect(listeners.onSkip).toHaveBeenCalledTimes(1);
    expect(listeners.onSkip).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 0 },
      })
    );
  });

  test("receive specific page on call 'specific'", async () => {
    const mockFn = vi.fn(({ page }) => page);

    const scope = fork({
      handlers: [[pagination.__.executeFx, mockFn]],
    });

    await allSettled(pagination.start, { params: { page: 2 }, scope });
    await allSettled(pagination.specific, { scope, params: { page: 42 } });

    expect(scope.getState(pagination.$data)).toBe(42);
    expect(scope.getState(pagination.$error)).toBeNull();
    expect(scope.getState(pagination.$page)).toBe(42);
  });
});

describe('createHeadlessPagination with mapData', () => {
  test('mapData as a callback', async () => {
    const pagination = createHeadlessPagination({
      ...baseConfig,
      mapData: ({ result, params }) => {
        expect(result).toBe(1);
        expect(params).toEqual({ page: 1 });
        return result + 42;
      },
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, vi.fn(({ page }) => page)]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toEqual(1 + 42);
    expect(listeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 1 },
        result: 1 + 42,
      })
    );
  });

  test('mapData as a sourced callback', async () => {
    const $source = createStore('');
    const pagination = createHeadlessPagination({
      ...baseConfig,
      mapData: {
        source: $source,
        fn: ({ result }, source) => {
          expect(source).toBe('');
          return result + 42;
        },
      },
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, vi.fn(({ page }) => page)]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$data)).toEqual(1 + 42);
    expect(listeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 1 },
        result: 1 + 42,
      })
    );
  });
});

describe('createHeadlessPagination with contract', () => {
  test('contract validate unsuccessfully', async () => {
    const pagination = createHeadlessPagination({
      ...baseConfig,
      contract: {
        isData: (value): value is unknown => false,
        getErrorMessages: () => ['error'],
      },
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, vi.fn(({ page }) => page)]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    const error = invalidDataError({
      validationErrors: ['error'],
      response: 1,
    });

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$error)).toEqual(error);
    expect(listeners.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 1 },
        error,
      })
    );
  });
});

describe('createHeadlessPagination with validate', () => {
  test('validation failure', async () => {
    const pagination = createHeadlessPagination({
      ...baseConfig,
      validate: () => ['error'],
    });

    const scope = fork({
      handlers: [[pagination.__.executeFx, vi.fn(({ page }) => page)]],
    });

    const { listeners } = watchRemoteOperation(pagination, scope);

    const error = {
      errorType: 'INVALID_DATA',
      explanation:
        'Response was considered as invalid against a given contract',
      validationErrors: ['error'],
      response: 1,
    };

    await allSettled(pagination.start, { scope, params: { page: 1 } });
    expect(scope.getState(pagination.$error)).toEqual(error);
    expect(listeners.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 1 },
        error,
      })
    );
  });
});
