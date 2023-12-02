import { allSettled, createStore, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { watchRemoteOperation } from '../../test_utils/watch_query';
import { unknownContract } from '../../contract/unknown_contract';
import { fetchFx } from '../../fetch/fetch';
import { createJsonMutation } from '../../mutation/create_json_mutation';

import { createMutation } from '../../mutation/create_mutation';
import { attachOperation } from '../attach';

describe('attach for mutation', () => {
  test('execute original handler as handler', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValue('data from original mutation');

    const originalMutation = createMutation({ handler: originalHandler });
    const attachedMutation = attachOperation(originalMutation);

    const scope = fork();

    const { listeners: originalListeners } = watchRemoteOperation(
      originalMutation,
      scope
    );
    const { listeners: attachedListeners } = watchRemoteOperation(
      attachedMutation,
      scope
    );

    await allSettled(attachedMutation.start, { scope });

    expect(originalHandler).toBeCalledTimes(1);
    expect(originalListeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'data from original mutation' })
    );
    expect(attachedListeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'data from original mutation' })
    );
  });

  test('attached queries do not overlap', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValueOnce('first response')
      .mockResolvedValueOnce('second response');

    const originalMutation = createMutation({ handler: originalHandler });

    const firstMutation = attachOperation(originalMutation);
    const secondMutation = attachOperation(originalMutation);

    const scope = fork();

    const { listeners: firstListeners } = watchRemoteOperation(
      firstMutation,
      scope
    );
    const { listeners: secondListeners } = watchRemoteOperation(
      secondMutation,
      scope
    );

    await allSettled(firstMutation.start, { scope });
    await allSettled(secondMutation.start, { scope });

    expect(firstListeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'first response' })
    );
    expect(secondListeners.onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'second response' })
    );
  });

  test('pass params from mapParams to original handler', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValue('data from original mutation');

    const originalMutation = createMutation({ handler: originalHandler });
    const attachedMutation = attachOperation(originalMutation, {
      mapParams: (v: number) => v * 2,
    });

    const scope = fork();

    await allSettled(attachedMutation.start, { scope, params: 1 });
    await allSettled(attachedMutation.start, { scope, params: 2 });

    expect(originalHandler).toBeCalledTimes(2);

    expect(originalHandler).toBeCalledWith(2);
    expect(originalHandler).toBeCalledWith(4);
  });

  test('uses source as second arguments in mapParams', async () => {
    const originalHandler = vi
      .fn()
      .mockResolvedValue('data from original mutation');

    const $source = createStore(1);

    const originalMutation = createMutation({ handler: originalHandler });
    const attachedMutation = attachOperation(originalMutation, {
      source: $source,
      mapParams: (v: number, s) => s,
    });

    const scope = fork();

    await allSettled($source, { scope, params: 11 });
    await allSettled(attachedMutation.start, { scope, params: 1 });

    await allSettled($source, { scope, params: 55 });
    await allSettled(attachedMutation.start, { scope, params: 2 });

    expect(originalHandler).toBeCalledTimes(2);

    expect(originalHandler).toBeCalledWith(11);
    expect(originalHandler).toBeCalledWith(55);
  });

  test('supports special factories', async () => {
    const originalMutation = createJsonMutation({
      request: { method: 'GET', url: 'https://api.salo.com' },
      response: { contract: unknownContract },
    });

    const attachedMutation = attachOperation(originalMutation);

    const fetchMock = vi.fn().mockRejectedValue(new Error('cannot'));

    const scope = fork({ handlers: [[fetchFx, fetchMock]] });

    await allSettled(attachedMutation.start, { scope });

    expect(fetchMock).toBeCalledTimes(1);
    expect(await fetchMock.mock.calls[0][0].url).toBe('https://api.salo.com/');
  });
});
