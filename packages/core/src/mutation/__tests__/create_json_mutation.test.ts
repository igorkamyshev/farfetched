import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { abortError } from '../../errors/create_error';
import { fetchFx } from '../../fetch/fetch';
import { createJsonMutation } from '../create_json_mutation';
import { isMutation } from '../type';

describe('createJsonMutation', () => {
  test('isMutation', () => {
    const mutation = createJsonMutation({
      request: { url: 'https://api.salo.com', method: 'GET' },
      response: { contract: unknownContract },
    });

    expect(isMutation(mutation)).toBeTruthy();
  });

  test('start triggers executeFx', async () => {
    const mutation = createJsonMutation({
      request: { url: 'https://api.salo.com', method: 'GET' },
      response: { contract: unknownContract },
    });

    const mockFn = vi.fn();

    const scope = fork({ handlers: [[mutation.__.executeFx, mockFn]] });

    await allSettled(mutation.start, { scope });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith({
      body: null,
      headers: null,
      query: null,
      url: 'https://api.salo.com',
    });
  });

  test('pass custom headers to request', async () => {
    const mutation = createJsonMutation({
      request: {
        url: 'https://api.salo.com',
        method: 'GET',
        headers: { 'x-custom-header': 'custom' },
      },
      response: { contract: unknownContract },
    });

    const mockFn = vi.fn();

    const scope = fork({ handlers: [[mutation.__.executeFx, mockFn]] });

    await allSettled(mutation.start, { scope });

    expect(mockFn).toHaveBeenCalledWith({
      body: null,
      headers: { 'x-custom-header': 'custom' },
      query: null,
      url: 'https://api.salo.com',
    });
  });

  test('pass custom query to request', async () => {
    const mutation = createJsonMutation({
      request: {
        url: 'https://api.salo.com',
        method: 'GET',
        query: { custom: 'query' },
      },
      response: { contract: unknownContract },
    });

    const mockFn = vi.fn();

    const scope = fork({ handlers: [[mutation.__.executeFx, mockFn]] });

    await allSettled(mutation.start, { scope });

    expect(mockFn).toHaveBeenCalledWith({
      body: null,
      headers: null,
      query: { custom: 'query' },
      url: 'https://api.salo.com',
    });
  });

  test('fail mutation on invalid method', async () => {
    const mutation = createJsonMutation({
      request: {
        url: 'https://api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract, status: { expected: 201 } },
    });

    const scope = fork({
      handlers: [[fetchFx, () => new Response(null, { status: 200 })]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope });

    expect(listeners.onFailure).toHaveBeenCalled();
    expect(listeners.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        error: {
          errorType: 'INVALID_DATA',
          explanation:
            'Response was considered as invalid against a given contract',
          validationErrors: [
            'Expected response status has to be one of [201], got 200',
          ],
          response: null,
        },
        params: undefined,
      })
    );
  });

  test('allow empty response', async () => {
    const mutation = createJsonMutation({
      request: {
        url: 'https://api.salo.com',
        method: 'GET' as const,
      },
      response: { contract: unknownContract },
    });

    const scope = fork({
      handlers: [[fetchFx, () => new Response(null)]],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    await allSettled(mutation.start, { scope });

    expect(listeners.onSuccess).toHaveBeenCalled();
    expect(listeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        result: null,
        params: undefined,
      })
    );
  });

  test('cancel json mutation by external clock', async () => {
    const abort = createEvent();

    const mutation = createJsonMutation({
      request: { method: 'GET', url: 'https://api.salo.com' },
      response: { contract: unknownContract },
      concurrency: { abort },
    });

    const scope = fork({
      handlers: [
        [
          // We have to mock fetchFx because executeFx contains cancellation logic
          fetchFx,
          vi.fn().mockImplementation(async () => {
            await setTimeout(100);
            throw new Error('cannot');
          }),
        ],
      ],
    });

    const { listeners } = watchRemoteOperation(mutation, scope);

    allSettled(mutation.start, { scope });
    await allSettled(abort, { scope });

    expect(listeners.onFailure).toBeCalledTimes(1);
    expect(listeners.onFailure).toHaveBeenCalledWith(
      expect.objectContaining({ error: abortError() })
    );
  });

  test('pass credentials to fetch', async () => {
    const mutation = createJsonMutation({
      request: {
        method: 'GET',
        url: 'https://api.salo.com',
        credentials: 'omit',
      },
      response: { contract: unknownContract },
    });

    const fetchMock = vi.fn().mockImplementation(async () => {
      throw new Error('cannot');
    });

    const scope = fork({
      handlers: [[fetchFx, fetchMock]],
    });

    await allSettled(mutation.start, { scope });

    expect(fetchMock).toBeCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ credentials: 'omit' })
    );
  });
});
