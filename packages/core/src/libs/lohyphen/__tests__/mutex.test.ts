/*
 * Test cases copied from https://github.com/DirtyHairy/async-mutex with:
 * - some modifications to make it work with vitest
 * - some reductions because they are excessive for our use case
 */

import { setTimeout } from 'timers/promises';
import { describe, expect, test } from 'vitest';

import { Mutex } from '../mutex';

describe('mutex', () => {
  test('new mutex is unlocked', () => {
    const mutex = new Mutex();
    expect(mutex.isLocked).toBeFalsy();
  });

  test('the release method releases a locked mutex', async () => {
    const mutex = new Mutex();
    mutex.acquire();

    expect(mutex.isLocked).toBeTruthy();

    mutex.release();
    expect(mutex.isLocked).toBeFalsy();
  });

  test('calling release on a unlocked mutex does not throw', () => {
    const mutex = new Mutex();
    mutex.release();
  });

  test('multiple calls to release behave as expected', async () => {
    const mutex = new Mutex();

    let v = 0;
    const run = async () => {
      await mutex.acquire();
      v++;
      mutex.release();
    };

    await Promise.all([run(), run(), run()]);

    expect(v).toBe(3);
  });

  test.concurrent(
    'waitForUnlock does not block while the mutex has not been acquired',
    async () => {
      const mutex = new Mutex();

      let taskCalls = 0;
      const awaitUnlockWrapper = async () => {
        await mutex.waitForUnlock();
        taskCalls++;
      };

      awaitUnlockWrapper();
      awaitUnlockWrapper();

      await setTimeout(1);

      expect(taskCalls).toBe(2);
    }
  );

  test('waitForUnlock blocks when the mutex has been acquired', async () => {
    const mutex = new Mutex();

    let taskCalls = 0;
    const awaitUnlockWrapper = async () => {
      await mutex.waitForUnlock();
      taskCalls++;
    };

    mutex.acquire();
    awaitUnlockWrapper();
    awaitUnlockWrapper();

    await setTimeout(1);

    expect(taskCalls).toBe(0);
  });

  test('waitForUnlock unblocks after a release', async () => {
    const mutex = new Mutex();

    let taskCalls = 0;
    const awaitUnlockWrapper = async () => {
      await mutex.waitForUnlock();
      taskCalls++;
    };
    mutex.acquire();
    awaitUnlockWrapper();
    awaitUnlockWrapper();

    await setTimeout(1);

    expect(taskCalls).toBe(0);

    mutex.release();

    await setTimeout(1);
    expect(taskCalls).toBe(2);
  });

  test('waitForUnlock only unblocks when the mutex can actually be acquired again', async () => {
    const mutex = new Mutex();

    mutex.acquire();
    mutex.acquire();
    let flag = false;
    mutex.waitForUnlock().then(() => (flag = true));
    mutex.release();
    await setTimeout(1);
    expect(flag).toBe(true);
  });

  test('waitForUnlock reblocks after acquiring', async () => {
    const mutex = new Mutex();

    let taskCalls = 0;
    const awaitUnlockWrapper = async () => {
      await mutex.waitForUnlock();
      taskCalls++;
    };

    awaitUnlockWrapper();

    await setTimeout(1);
    expect(taskCalls).toBe(1);

    mutex.acquire();

    awaitUnlockWrapper();
    await setTimeout(1);
    expect(taskCalls).toBe(1);

    mutex.release();
    await setTimeout(1);

    expect(taskCalls).toBe(2);
  });
});
