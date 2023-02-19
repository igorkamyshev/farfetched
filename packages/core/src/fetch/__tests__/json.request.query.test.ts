import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { fetchFx } from '../fetch';
import { createJsonApiRequest } from '../json';

describe('fetch/json.request.query', () => {
  test('pass static string as is', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
        query: 'foo[]=1&foo[]=2&foo[]=3',
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo[]=1&foo[]=2&foo[]=3'
    );
  });

  test('merge static and dynamic string', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
        query: 'foo[]=1&foo[]=2&foo[]=3',
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { query: 'lol=kek' },
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo[]=1&foo[]=2&foo[]=3&lol=kek'
    );
  });

  test('pass dynamic string as is', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { query: 'foo[]=1&foo[]=2&foo[]=3' },
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo[]=1&foo[]=2&foo[]=3'
    );
  });

  test('pass dynamic object as is', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { query: { foo: 1, bar: 'val' } },
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo=1&bar=val'
    );
  });

  test('merge static object and dynamic object', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
        query: { foo: 1 },
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { query: { bar: 'val' } },
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo=1&bar=val'
    );
  });

  test('pass static object as is', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
        query: { foo: 1, bar: 'val' },
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: {},
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo=1&bar=val'
    );
  });

  test('merge static string and dyamic object', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
        query: 'foo[]=1&foo[]=2&foo[]=3',
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { query: { bar: 'val' } },
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?foo[]=1&foo[]=2&foo[]=3&bar=val'
    );
  });

  test('merge static object and dyamic string', async () => {
    const callJsonApiFx = createJsonApiRequest({
      request: {
        method: 'GET' as const,
        url: 'https://api.salo.com',
        credentials: 'same-origin' as const,
        query: { bar: 'val' },
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(callJsonApiFx, {
      scope,
      params: { query: 'foo[]=1&foo[]=2&foo[]=3' },
    });

    expect(fetchMock.mock.calls[0][0].url).toBe(
      'https://api.salo.com/?bar=val&foo[]=1&foo[]=2&foo[]=3'
    );
  });
});
