import { describe, vi, expect, test } from 'vitest';
import { fork, allSettled, createStore, combine } from 'effector';
import { firstArg } from '@farfetched/test-utils';

import { withFactory } from '../../../libs/patronus';
import { createJsonQuery } from '../../../query/create_json_query';
import { unknownContract } from '../../../contract/unknown_contract';
import { declareParams } from '../../../remote_operation/params';
import { FetchApiRecord } from '../../../fetch/lib';
import { enrichStartWithKey } from '../key';

describe('key, sourced, createJsonQuery', () => {
  test('respect url as store', async () => {
    const $url = createStore('https://old.url');

    const query = withFactory({
      fn: () =>
        createJsonQuery({
          request: { url: $url, method: 'GET' },
          response: { contract: unknownContract },
        }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();
    startWithKey.watch(listener);

    const scope = fork({ handlers: [[query.__.executeFx, vi.fn()]] });

    // Start with old url
    await allSettled(query.start, { scope });

    // Change url
    await allSettled($url, { scope, params: 'https://new.url' });

    // Start with new url
    await allSettled(query.start, { scope });

    expect(firstArg(listener, 0).key).not.toBe(firstArg(listener, 1).key);
  });

  test('respect body as function with external source', async () => {
    const $language = createStore('ru');

    const query = withFactory({
      fn: () =>
        createJsonQuery({
          params: declareParams<number>(),
          request: {
            url: 'https://api.salo.com',
            method: 'POST',
            body: { source: $language, fn: (param, lang) => param + lang },
          },
          response: { contract: unknownContract },
        }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();
    startWithKey.watch(listener);

    const scope = fork({ handlers: [[query.__.executeFx, vi.fn()]] });

    // Start with old language
    await allSettled(query.start, { scope, params: 1 });

    // Change language
    await allSettled($language, { scope, params: 'en' });

    // Start with new language and same params
    await allSettled(query.start, { scope, params: 1 });

    expect(firstArg(listener, 0).key).not.toBe(firstArg(listener, 1).key);
  });

  test('respects headers as store', async () => {
    const $language = createStore('ru');

    const query = withFactory({
      fn: () =>
        createJsonQuery({
          params: declareParams<number>(),
          request: {
            url: 'https://api.salo.com',
            method: 'GET',
            headers: combine(
              { 'X-Lang': $language },
              (h) => h as FetchApiRecord
            ),
          },
          response: { contract: unknownContract },
        }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();
    startWithKey.watch(listener);

    const scope = fork({ handlers: [[query.__.executeFx, vi.fn()]] });

    // Start with old language
    await allSettled(query.start, { scope, params: 1 });

    // Change language
    await allSettled($language, { scope, params: 'en' });

    // Start with new language and same params
    await allSettled(query.start, { scope, params: 1 });

    expect(firstArg(listener, 0).key).not.toBe(firstArg(listener, 1).key);
  });

  test('respects query as store', async () => {
    const $language = createStore('ru');

    const query = withFactory({
      fn: () =>
        createJsonQuery({
          params: declareParams<number>(),
          request: {
            url: 'https://api.salo.com',
            method: 'GET',
            query: combine({ lang: $language }, (h) => h as FetchApiRecord),
          },
          response: { contract: unknownContract },
        }),
      sid: '1',
    });

    const startWithKey = enrichStartWithKey(query);

    const listener = vi.fn();
    startWithKey.watch(listener);

    const scope = fork({ handlers: [[query.__.executeFx, vi.fn()]] });

    // Start with old language
    await allSettled(query.start, { scope, params: 1 });

    // Change language
    await allSettled($language, { scope, params: 'en' });

    // Start with new language and same params
    await allSettled(query.start, { scope, params: 1 });

    expect(firstArg(listener, 0).key).not.toBe(firstArg(listener, 1).key);
  });
});
