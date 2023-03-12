import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';
import { unknownContract } from '../../contract/unknown_contract';
import { createJsonQuery } from '../../query/create_json_query';
import { createQuery } from '../../query/create_query';
import { declareParams } from '../../remote_operation/params';
import { keepFresh } from '../keep_fresh';

describe('keepFresh, triggers', () => {
  test('execute query on setup', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const query = createQuery({ handler: listener });

    keepFresh(query, { onSourcesUpdate: true });

    const scope = fork();

    expect(scope.getState(query.$stale)).toBeTruthy();

    await allSettled(query.refresh, { scope });

    expect(scope.getState(query.$stale)).toBeFalsy();
    expect(listener).toBeCalledTimes(1);
  });

  test('mark Query as stale and refresh after source change', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const $language = createStore('en');

    const queryWithSourced = createJsonQuery({
      request: {
        url: { source: $language, fn: (_, lang) => `/api/${lang}` },
        method: 'GET',
      },
      response: { contract: unknownContract },
    });

    keepFresh(queryWithSourced, { onSourcesUpdate: true });

    const scope = fork({
      handlers: [[queryWithSourced.__.executeFx, listener]],
    });

    await allSettled(queryWithSourced.refresh, { scope });

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(
      expect.objectContaining({ url: '/api/en' })
    );

    allSettled($language, { scope, params: 'ru' });

    expect(scope.getState(queryWithSourced.$stale)).toBeTruthy();

    await allSettled(scope);

    expect(scope.getState(queryWithSourced.$stale)).toBeFalsy();
    expect(listener).toBeCalledTimes(2);
    expect(listener).toBeCalledWith(
      expect.objectContaining({ url: '/api/ru' })
    );
  });

  test('skip refresh if source does not affect final value', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const $language = createStore('en');

    const queryWithSourced = createJsonQuery({
      request: {
        url: { source: $language, fn: (_, lang) => `/api/${lang.length}` },
        method: 'GET',
      },
      response: { contract: unknownContract },
    });

    keepFresh(queryWithSourced, { onSourcesUpdate: true });

    const scope = fork({
      handlers: [[queryWithSourced.__.executeFx, listener]],
    });

    await allSettled(queryWithSourced.refresh, { scope });

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(expect.objectContaining({ url: '/api/2' }));

    // same length, no refresh
    allSettled($language, { scope, params: 'ru' });
    expect(scope.getState(queryWithSourced.$stale)).toBeFalsy();

    await allSettled(scope);
    expect(listener).toBeCalledTimes(1);

    // refresh, length changed
    allSettled($language, { scope, params: 'geNNNN' });
    expect(scope.getState(queryWithSourced.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(listener).toBeCalledTimes(2);
    expect(scope.getState(queryWithSourced.$stale)).toBeFalsy();
  });

  test('use latest params form while refreshing', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const $language = createStore('en');

    const queryWithSourced = createJsonQuery({
      params: declareParams<string>(),
      request: {
        url: { source: $language, fn: (_, lang) => `/api/${lang}` },
        query: (params) => ({ passed: params }),
        method: 'GET',
      },
      response: { contract: unknownContract },
    });

    keepFresh(queryWithSourced, { onSourcesUpdate: true });

    const scope = fork({
      handlers: [[queryWithSourced.__.executeFx, listener]],
    });

    await allSettled(queryWithSourced.refresh, { scope, params: 'original' });
    expect(listener).toBeCalledWith(
      expect.objectContaining({
        url: '/api/en',
        query: { passed: 'original' },
      })
    );

    allSettled($language, { scope, params: 'ru' });
    expect(scope.getState(queryWithSourced.$stale)).toBeTruthy();

    await allSettled(scope);
    expect(scope.getState(queryWithSourced.$stale)).toBeFalsy();
    expect(listener).toBeCalledTimes(2);
    expect(listener).toBeCalledWith(
      expect.objectContaining({ url: '/api/ru', query: { passed: 'original' } })
    );
  });

  test.todo('handle params changes between refreshes');
});
