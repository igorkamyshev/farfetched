import { allSettled, createStore, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';
import { unknownContract } from '../../contract/unknown_contract';
import { createJsonQuery } from '../../query/create_json_query';
import { createQuery } from '../../query/create_query';
import { declareParams } from '../../remote_operation/params';
import { keepFresh } from '../keep_fresh';

describe('keepFresh, automatically', () => {
  test('execute query on setup', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const query = createQuery({ handler: listener });

    keepFresh(query, { automatically: true });

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

    keepFresh(queryWithSourced, { automatically: true });

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

    keepFresh(queryWithSourced, { automatically: true });

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

    keepFresh(queryWithSourced, { automatically: true });

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

  test('handle params changes between refreshes', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const $language = createStore('en');

    const queryWithSourced = createJsonQuery({
      params: declareParams<string>(),
      request: {
        url: {
          source: $language,
          fn: (params, lang) => `/api/${lang.length + params.length}`,
        },
        method: 'GET',
      },
      response: { contract: unknownContract },
    });

    keepFresh(queryWithSourced, { automatically: true });

    const scope = fork({
      handlers: [[queryWithSourced.__.executeFx, listener]],
    });

    await allSettled(queryWithSourced.refresh, { scope, params: 'o' });
    expect(listener).toBeCalledWith(
      expect.objectContaining({
        url: '/api/3', // 2 from lang and 1 from params
      })
    );

    allSettled($language, { scope, params: 'ru' });
    expect(scope.getState(queryWithSourced.$stale)).toBeFalsy();

    await allSettled(scope);
    expect(listener).toBeCalledTimes(1);
  });

  test('batching', async () => {
    const listener = vi.fn(async (_: void) => 42);

    const $language = createStore('en');
    const $market = createStore('ru');

    const queryWithSourced = createJsonQuery({
      request: {
        url: {
          source: $language,
          fn: (params, lang) => `/api/${lang}`,
        },
        query: { source: $market, fn: (_, maket) => ({ maket }) },
        method: 'GET',
      },
      response: { contract: unknownContract },
    });

    keepFresh(queryWithSourced, { automatically: true });

    const scope = fork({
      handlers: [[queryWithSourced.__.executeFx, listener]],
    });

    await allSettled(queryWithSourced.refresh, { scope });

    expect(listener).toBeCalledTimes(1);

    allSettled($language, { scope, params: 'ge' });
    allSettled($market, { scope, params: 'ge' });

    await allSettled(scope);

    expect(listener).toBeCalledTimes(2);
  });

  test('does not use sources while disabled as source for refresh', async () => {
    const $url = createStore('https://api.salo.com');

    const query = createJsonQuery({
      enabled: $url.map((url) => url.length > 0),
      request: {
        method: 'GET',
        url: $url,
      },
      response: { contract: unknownContract },
    });

    keepFresh(query, { automatically: true });

    const scope = fork({
      handlers: [[query.__.executeFx, vi.fn(async () => 42)]],
    });

    const listener = vi.fn();

    createWatch({ unit: query.refresh, fn: listener, scope });

    await allSettled(query.refresh, { scope });

    await allSettled($url, { scope, params: '' });
    await allSettled($url, { scope, params: 'https://api.salo.com' });

    expect(listener).toBeCalledTimes(1);
  });

  test('check source after enabling', async () => {
    const $url = createStore('https://api.salo.com');
    const $enabled = createStore(true);

    const query = createJsonQuery({
      enabled: $enabled,
      request: {
        method: 'GET',
        url: $url,
      },
      response: { contract: unknownContract },
    });

    keepFresh(query, { automatically: true });

    const scope = fork({
      handlers: [[query.__.executeFx, vi.fn(async () => 42)]],
    });

    const listener = vi.fn();

    createWatch({ unit: query.refresh, fn: listener, scope });

    await allSettled(query.refresh, { scope });
    expect(listener).toBeCalledTimes(1);

    await allSettled($enabled, { scope, params: false });
    await allSettled($url, { scope, params: 'https://api.v2.salo.com' });
    await allSettled($enabled, { scope, params: true });

    expect(listener).toBeCalledTimes(2);
  });

  test('should respect extraDependencies of query', async () => {
    const $extraDependency = createStore(42);

    const query = createJsonQuery({
      request: {
        method: 'GET',
        url: 'https://api.salo.com',
      },
      response: { contract: unknownContract },

      extraDependencies: $extraDependency,
    });

    keepFresh(query, { automatically: true });

    const scope = fork({
      handlers: [[query.__.executeFx, vi.fn(async () => 42)]],
    });

    const listener = vi.fn();

    createWatch({ unit: query.refresh, fn: listener, scope });

    await allSettled(query.refresh, { scope });
    expect(listener).toBeCalledTimes(1);

    await allSettled($extraDependency, { scope, params: 24 });

    expect(listener).toBeCalledTimes(2);
  });
});
