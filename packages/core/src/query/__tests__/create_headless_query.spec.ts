import { allSettled, createStore, fork } from 'effector';

import { watchQuery } from '@farfetched/test-utils';

import { createHeadlessQuery } from '../create_headless_query';
import { createDefer } from '../../misc/defer';
import { unkownContract } from '../../contract/unkown_contract';
import { InvalidDataError } from '../../contract/error';
import { identity } from '../../misc/identity';

describe('core/createHeadlessQuery without contract', () => {
  const query = createHeadlessQuery(
    { contract: unkownContract, mapData: identity },
    { sid: 'any_string' }
  );

  test('start triggers executeFx', async () => {
    const mockFn = jest.fn();

    const scope = fork({ handlers: [[query.__.executeFx, mockFn]] });

    await allSettled(query.start, { scope, params: 42 });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(42);
  });

  test('done.success triggers after executeFx.done', async () => {
    const scope = fork({ handlers: [[query.__.executeFx, jest.fn((p) => p)]] });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBe(42);
    expect(scope.getState(query.$error)).toBeNull();
    expect(listeners.onDone).toHaveBeenCalledTimes(1);
    expect(listeners.onDone).toHaveBeenCalledWith(42);

    expect(listeners.onSkip).not.toHaveBeenCalled();
    expect(listeners.onError).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(undefined);
  });

  test('done.error triggers after executeFx.fail', async () => {
    const scope = fork({
      handlers: [
        [
          query.__.executeFx,
          jest.fn(() => {
            throw new Error('from mock');
          }),
        ],
      ],
    });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$error)).toEqual(new Error('from mock'));
    expect(scope.getState(query.$data)).toBeNull();

    expect(listeners.onError).toHaveBeenCalledTimes(1);
    expect(listeners.onError).toHaveBeenCalledWith(new Error('from mock'));

    expect(listeners.onDone).not.toHaveBeenCalled();
    expect(listeners.onSkip).not.toHaveBeenCalled();

    expect(listeners.onFinally).toHaveBeenCalledTimes(1);
    expect(listeners.onFinally).toHaveBeenCalledWith(undefined);
  });

  test('$status changes on stages', async () => {
    const executorFirstDefer = createDefer();
    const executorSecondDefer = createDefer();

    const scope = fork({
      handlers: [
        [
          query.__.executeFx,
          jest
            .fn()
            .mockImplementationOnce(() => executorFirstDefer.promise)
            .mockImplementationOnce(() => executorSecondDefer.promise),
        ],
      ],
    });

    expect(scope.getState(query.$status)).toBe('initial');
    expect(scope.getState(query.$pending)).toBeFalsy();

    // do not await
    allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$status)).toBe('pending');
    expect(scope.getState(query.$pending)).toBeTruthy();

    executorFirstDefer.resolve('result');
    await executorFirstDefer.promise;

    expect(scope.getState(query.$status)).toBe('done');
    expect(scope.getState(query.$pending)).toBeFalsy();

    // do not await
    allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$status)).toBe('pending');
    expect(scope.getState(query.$pending)).toBeTruthy();

    executorSecondDefer.reject(new Error('error'));
    await executorSecondDefer.promise.catch(() => {
      //pass
    });

    expect(scope.getState(query.$status)).toBe('fail');
    expect(scope.getState(query.$pending)).toBeFalsy();
  });

  test('re-execute', async () => {
    const scope = fork({
      handlers: [
        [
          query.__.executeFx,
          jest
            .fn()
            .mockResolvedValueOnce('first done')
            .mockRejectedValueOnce(new Error('first error'))
            .mockResolvedValueOnce('second done')
            .mockRejectedValueOnce(new Error('second error')),
        ],
      ],
    });

    // first done
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBe('first done');
    expect(scope.getState(query.$error)).toBeNull();

    // first error
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBeNull();
    expect(scope.getState(query.$error)).toEqual(new Error('first error'));

    // second done
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBe('second done');
    expect(scope.getState(query.$error)).toBeNull();

    // second error
    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toBeNull();
    expect(scope.getState(query.$error)).toEqual(new Error('second error'));
  });
});

describe('core/createHeadlessQuery with contract', () => {
  test('contract find error', async () => {
    const extractedError = Symbol('extractedError');

    const query = createHeadlessQuery(
      {
        contract: {
          data: { validate: () => null, extract: () => null },
          error: { is: () => true, extract: () => extractedError },
        },
        mapData: identity,
      },
      { sid: 'any_string' }
    );

    const scope = fork({ handlers: [[query.__.executeFx, jest.fn()]] });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$error)).toEqual(extractedError);

    expect(listeners.onError).toHaveBeenCalledTimes(1);
    expect(listeners.onError).toHaveBeenCalledWith(extractedError);
  });

  test('contract find invalid data', async () => {
    const query = createHeadlessQuery(
      {
        contract: {
          data: { validate: () => ['got it'], extract: () => null },
          error: { is: () => false, extract: () => null },
        },
        mapData: identity,
      },
      { sid: 'any_string' }
    );

    const scope = fork({ handlers: [[query.__.executeFx, jest.fn()]] });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$error)).toEqual(
      new InvalidDataError(null, ['got it'])
    );

    expect(listeners.onError).toHaveBeenCalledTimes(1);
    expect(listeners.onError).toHaveBeenCalledWith(
      new InvalidDataError(null, ['got it'])
    );
  });

  test('contract transforms data', async () => {
    const extractedData = Symbol('extractedData');

    const query = createHeadlessQuery(
      {
        contract: {
          data: { validate: () => null, extract: () => extractedData },
          error: { is: () => false, extract: () => null },
        },
        mapData: identity,
      },
      { sid: 'any_string' }
    );

    const scope = fork({ handlers: [[query.__.executeFx, jest.fn()]] });

    const { listeners } = watchQuery(query, scope);

    await allSettled(query.start, { scope, params: 42 });

    expect(scope.getState(query.$data)).toEqual(extractedData);

    expect(listeners.onDone).toHaveBeenCalledTimes(1);
    expect(listeners.onDone).toHaveBeenCalledWith(extractedData);
  });

  test('contract receives response (for data)', async () => {
    const response = Symbol('response');

    const validate = jest.fn().mockReturnValue(null);
    const extract = jest.fn().mockReturnValue(null);

    const query = createHeadlessQuery(
      {
        contract: {
          data: { validate, extract },
          error: { is: () => false, extract: () => null },
        },
        mapData: identity,
      },
      { sid: 'any_string' }
    );

    const scope = fork({
      handlers: [[query.__.executeFx, jest.fn(() => response)]],
    });

    await allSettled(query.start, { scope, params: 42 });

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith(response);

    expect(extract).toHaveBeenCalledTimes(1);
    expect(extract).toHaveBeenCalledWith(response);
  });

  test('contract receives response (for error)', async () => {
    const response = Symbol('response');

    const is = jest.fn().mockReturnValue(true);
    const extract = jest.fn().mockReturnValue(null);

    const query = createHeadlessQuery(
      {
        contract: {
          data: { validate: () => null, extract: () => null },
          error: { is, extract },
        },
        mapData: identity,
      },
      { sid: 'any_string' }
    );

    const scope = fork({
      handlers: [[query.__.executeFx, jest.fn(() => response)]],
    });

    await allSettled(query.start, { scope, params: 42 });

    expect(is).toHaveBeenCalledTimes(1);
    expect(is).toHaveBeenCalledWith(response);

    expect(extract).toHaveBeenCalledTimes(1);
    expect(extract).toHaveBeenCalledWith(response);
  });
});

describe('core/createHeadlessQuery with contract and', () => {
  test('core/createHeadlessQuery with contract and mapData (callback)', async () => {
    const rawRata = Symbol('rawRata');
    const passedParams = Symbol('passedParams');
    const mappedData = Symbol('mappedData');

    const query = createHeadlessQuery(
      {
        contract: unkownContract,
        mapData(data, params) {
          expect(data).toBe(rawRata);
          expect(params).toBe(passedParams);
          return mappedData;
        },
      },
      { sid: 'random_sid' }
    );

    const scope = fork({
      handlers: [[query.__.executeFx, jest.fn(() => rawRata)]],
    });

    await allSettled(query.start, { scope, params: passedParams });

    expect(scope.getState(query.$data)).toEqual(mappedData);
  });

  test('sourced callback)', async () => {
    const $source = createStore('first');

    const mappedData = Symbol('mappedData');

    const query = createHeadlessQuery(
      {
        contract: unkownContract,
        mapData: {
          source: $source,
          fn: (data, params, source) => {
            expect(source).toBe('first');
            return mappedData;
          },
        },
      },
      { sid: 'random_sid' }
    );

    const scope = fork({
      handlers: [[query.__.executeFx, jest.fn()]],
    });

    await allSettled(query.start, { scope, params: 'random data' });

    expect(scope.getState(query.$data)).toEqual(mappedData);
  });
});
