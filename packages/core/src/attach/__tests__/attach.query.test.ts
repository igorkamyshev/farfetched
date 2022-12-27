import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { createQuery } from '../../query/create_query';

describe('attach for query', () => {
  test('execute original handler as handler', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValue('data from original query');

    const originalQuery = createQuery({ handler: originalHandler });
    const attachedQuery = originalQuery['@@attach']({
      source: createStore(null),
      mapParams: (v: void) => v,
    });

    const scope = fork();

    await allSettled(attachedQuery.start, { scope });

    expect(originalHandler).toBeCalledTimes(1);
    expect(scope.getState(attachedQuery.$data)).toBe(
      'data from original query'
    );
    expect(scope.getState(originalQuery.$data)).toBe(
      'data from original query'
    );
  });

  test('attached queries do not overlap', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValueOnce('first response')
      .mockResolvedValueOnce('second response');

    const originalQuery = createQuery({ handler: originalHandler });

    const firstQuery = originalQuery['@@attach']({
      source: createStore(null),
      mapParams: (v: void) => v,
    });

    const secondQuery = originalQuery['@@attach']({
      source: createStore(null),
      mapParams: (v: void) => v,
    });

    const scope = fork();

    await allSettled(firstQuery.start, { scope });
    await allSettled(secondQuery.start, { scope });

    expect(scope.getState(firstQuery.$data)).toBe('first response');
    expect(scope.getState(secondQuery.$data)).toBe('second response');
  });

  test('pass params from mapParams to original handler', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValue('data from original query');

    const originalQuery = createQuery({ handler: originalHandler });
    const attachedQuery = originalQuery['@@attach']({
      source: createStore(null),
      mapParams: (v: number) => v * 2,
    });

    const scope = fork();

    await allSettled(attachedQuery.start, { scope, params: 1 });
    await allSettled(attachedQuery.start, { scope, params: 2 });

    expect(originalHandler).toBeCalledTimes(2);

    expect(originalHandler).toBeCalledWith(2);
    expect(originalHandler).toBeCalledWith(4);
  });

  test('uses source as second arguments in mapParams', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValue('data from original query');

    const $source = createStore(1);

    const originalQuery = createQuery({ handler: originalHandler });
    const attachedQuery = originalQuery['@@attach']({
      source: $source,
      mapParams: (v: number, s) => s,
    });

    const scope = fork();

    await allSettled($source, { scope, params: 11 });
    await allSettled(attachedQuery.start, { scope, params: 1 });

    await allSettled($source, { scope, params: 55 });
    await allSettled(attachedQuery.start, { scope, params: 2 });

    expect(originalHandler).toBeCalledTimes(2);

    expect(originalHandler).toBeCalledWith(11);
    expect(originalHandler).toBeCalledWith(55);
  });
});
