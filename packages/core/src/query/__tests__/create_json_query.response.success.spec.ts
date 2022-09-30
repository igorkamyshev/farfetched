import { allSettled, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { watchRemoteOperation } from '@farfetched/test-utils';
import { createDefer } from '@farfetched/misc';

import { unknownContract } from '../../contract/unknown_contract';
import { createJsonQuery } from '../create_json_query';

describe('remote_data/query/json.response.success', () => {
  // Does not matter
  const request = {
    url: 'http://api.salo.com',
    method: 'GET' as const,
  };

  test('save data from success response', async () => {
    const requestDefer = createDefer();

    const response = Symbol('response');

    const query = createJsonQuery({
      request,
      response: { contract: unknownContract },
    });

    const fetchMock = jest.fn(() => requestDefer.promise);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    const watcher = watchRemoteOperation(query, scope);

    expect(scope.getState(query.$status)).toBe('initial');
    expect(scope.getState(query.$pending)).toBeFalsy();

    allSettled(query.start, { scope });

    expect(scope.getState(query.$status)).toBe('pending');
    expect(scope.getState(query.$pending)).toBeTruthy();

    requestDefer.resolve(response);
    await requestDefer.promise;
    await setTimeout();

    expect(scope.getState(query.$status)).toBe('done');
    expect(scope.getState(query.$pending)).toBeFalsy();

    expect(scope.getState(query.$data)).toBe(response);

    expect(watcher.listeners.onSuccess).toHaveBeenCalledWith({
      data: response,
    });
    expect(watcher.listeners.onSuccess).toHaveBeenCalledTimes(1);
  });

  test('save data from success response with mapping', async () => {
    const response = Symbol('response');
    const mapped = Symbol('mapped');

    const query = createJsonQuery({
      request,
      response: {
        contract: unknownContract,
        mapData() {
          return mapped;
        },
      },
    });

    const fetchMock = jest.fn(() => response);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });
    const watcher = watchRemoteOperation(query, scope);

    await allSettled(query.start, { scope });

    expect(scope.getState(query.$data)).toBe(mapped);
    expect(scope.getState(query.$error)).toBeNull();

    expect(watcher.listeners.onSuccess).toHaveBeenCalledWith({
      params: undefined,
      data: mapped,
    });
    expect(watcher.listeners.onSuccess).toHaveBeenCalledTimes(1);
  });

  test('save data from success response after error', async () => {
    const response = Symbol('response');
    const error = Symbol('error');

    const query = createJsonQuery({
      request,
      response: { contract: unknownContract },
    });

    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(response);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    // with error
    await allSettled(query.start, { scope });

    expect(scope.getState(query.$error)).toBe(error);
    expect(scope.getState(query.$data)).toBeNull();

    // with success
    await allSettled(query.start, { scope });

    expect(scope.getState(query.$data)).toBe(response);
    expect(scope.getState(query.$error)).toBeNull();
  });
});
