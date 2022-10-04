import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
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
    expect(listeners.onFailure).toHaveBeenCalledWith({
      error: {
        errorType: 'INVALID_DATA',
        explanation:
          'Response was considered as invalid against a given contract',
        validationErrors: [
          'Expected response status has to be one of [201], got 200',
        ],
      },
      params: undefined,
    });
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
    expect(listeners.onSuccess).toHaveBeenCalledWith({
      data: null,
      params: undefined,
    });
  });
});
