import { watchRemoteOperation } from '@farfetched/test-utils';
import { allSettled, fork } from 'effector';
import { createDefer } from '@farfetched/misc';

import { unknownContract } from '../../contract/unknown_contract';
import { createJsonQuery } from '../create_json_query';

describe('remote_data/query/json.response.error', () => {
  // Does not matter
  const request = {
    url: 'http://api.salo.com',
    method: 'GET' as const,
  };

  test('save error from failed response', async () => {
    const requestDefer = createDefer();
    const error = Symbol('error');

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

    requestDefer.reject(error);
    await requestDefer.promise.catch(() => null);

    expect(scope.getState(query.$status)).toBe('fail');
    expect(scope.getState(query.$pending)).toBeFalsy();

    expect(scope.getState(query.$data)).toBeNull();
    expect(scope.getState(query.$error)).toBe(error);

    expect(watcher.listeners.onFailure).toHaveBeenCalledWith({ error });
    expect(watcher.listeners.onFailure).toHaveBeenCalledTimes(1);
  });

  test('save data from error response after success', async () => {
    const response = Symbol('response');
    const error = Symbol('error');

    const query = createJsonQuery({
      request,
      response: { contract: unknownContract },
    });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(response)
      .mockRejectedValueOnce(error);

    const scope = fork({ handlers: [[query.__.executeFx, fetchMock]] });

    // with success
    await allSettled(query.start, { scope });

    expect(scope.getState(query.$data)).toBe(response);
    expect(scope.getState(query.$error)).toBeNull();

    // with error
    await allSettled(query.start, { scope });

    expect(scope.getState(query.$error)).toBe(error);
    expect(scope.getState(query.$data)).toBeNull();
  });
});
