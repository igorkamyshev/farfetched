import { allSettled, createStore, fork } from 'effector';

import { createQuery } from '../../query/create_query';
import { retry } from '../retry';

describe('retry', () => {
  it('starts query after failure with same args by default', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));
    const query = createQuery({
      handler,
    });

    retry({ query, times: 1, delay: 0 });

    const scope = fork();

    await allSettled(query.start, { scope, params: 'Some test param' });

    expect(handler).toBeCalledTimes(2);

    // Same args for retries
    expect(handler).toHaveBeenNthCalledWith(1, 'Some test param');
    expect(handler).toHaveBeenNthCalledWith(2, 'Some test param');
  });

  it('respects times (static)', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));
    const query = createQuery({
      handler,
    });

    retry({ query, times: 4, delay: 0 });

    const scope = fork();

    await allSettled(query.start, { scope, params: 'Some test param' });

    expect(handler).toBeCalledTimes(5);
  });

  it('respects delay (static)', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));
    const query = createQuery({
      handler,
    });

    retry({ query, times: 1, delay: 100 });

    const scope = fork();

    const start = Date.now();

    await allSettled(query.start, { scope, params: 'Some test param' });

    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(100);
  });

  it('respects delay (function)', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));
    const query = createQuery({
      handler,
    });

    retry({ query, times: 3, delay: ({ attempt }) => attempt * 100 });

    const scope = fork();

    const start = Date.now();

    await allSettled(query.start, { scope, params: 'Some test param' });

    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(100 + 200 + 300);
  });

  test('respects mapParams', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));
    const query = createQuery({
      handler,
    });

    retry({
      query,
      times: 3,
      delay: 0,
      mapParams: (oldParams, { attempt }) => `${oldParams} ${attempt}`,
    });

    const scope = fork();

    await allSettled(query.start, { scope, params: 'Initial' });

    expect(handler).toBeCalledTimes(4);
    expect(handler).toHaveBeenNthCalledWith(1, 'Initial');
    expect(handler).toHaveBeenNthCalledWith(2, 'Initial 1');
    expect(handler).toHaveBeenNthCalledWith(3, 'Initial 1 2');
    expect(handler).toHaveBeenNthCalledWith(4, 'Initial 1 2 3');
  });

  test('respects after success', async () => {
    const handler = jest
      .fn()
      .mockRejectedValueOnce(new Error('Sorry'))
      .mockRejectedValueOnce(new Error('Sorry'))
      .mockResolvedValueOnce('Success')
      .mockRejectedValueOnce(new Error('Sorry'))
      .mockRejectedValueOnce(new Error('Sorry'))
      .mockResolvedValueOnce('Success');

    const query = createQuery({
      handler,
    });

    retry({ query, times: 2, delay: 0 });

    const scope = fork();

    await allSettled(query.start, { scope });

    expect(handler).toBeCalledTimes(3);

    await allSettled(query.start, { scope });

    expect(scope.getState(query.$data)).toEqual('Success');
    expect(handler).toBeCalledTimes(6);
  });

  test('respects filter option (static)', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));

    const query = createQuery({
      handler,
    });

    retry({
      query,
      times: 10,
      delay: 0,
      filter: false,
    });

    const scope = fork();

    await allSettled(query.start, { scope });

    expect(handler).toBeCalledTimes(1);
  });

  test('respects filter option (store)', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Sorry'));

    const query = createQuery({
      handler,
    });

    retry({
      query,
      times: 10,
      delay: 0,
      filter: createStore(false),
    });

    const scope = fork();

    await allSettled(query.start, { scope });

    expect(handler).toBeCalledTimes(1);
  });

  test('respects filter option (function)', async () => {
    const queryError = new Error('Sorry');
    const handler = jest.fn().mockRejectedValue(queryError);

    const query = createQuery({
      handler,
    });

    retry({
      query,
      times: 10,
      delay: 0,
      filter: (e) => {
        expect(e).toBe(queryError);
        return false;
      },
    });

    const scope = fork();

    await allSettled(query.start, { scope });

    expect(handler).toBeCalledTimes(1);
  });
});
