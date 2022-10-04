/**
 * @jest-environment jsdom
 */

import { fork, scopeBind } from 'effector';

import { sessionStorageCache } from '../session_storage';

describe('sessionStorageCache', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('expire (in other tab)', async () => {
    jest.useFakeTimers();

    // Tab one
    const cacheTabOne = sessionStorageCache({ maxAge: '1sec' });

    const scopeTabOne = fork();

    await scopeBind(cacheTabOne.set, {
      scope: scopeTabOne,
    })({ key: 'key', value: 'myValue' });

    const resultOne = await scopeBind(cacheTabOne.get, {
      scope: scopeTabOne,
    })({ key: 'key' });
    expect(resultOne).toEqual('myValue');

    // Tick between tabs change, does not affect timer in cacheTabOne
    jest.advanceTimersByTime(1 * 1000);

    // Tab two
    const cacheTabTwo = sessionStorageCache({ maxAge: '1sec' });

    const scopeTabTwo = fork();

    const resultTwo = await scopeBind(cacheTabTwo.get, {
      scope: scopeTabTwo,
    })({ key: 'key' });
    expect(resultTwo).toBeNull();
    expect(sessionStorage.getItem('key')).toBeNull();
  });
});
