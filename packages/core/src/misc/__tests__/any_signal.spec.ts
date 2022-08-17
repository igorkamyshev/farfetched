import { createDefer } from '@farfetched/misc';

import { anySignal } from '../any_signal';

describe('anySignal', () => {
  test('should abort from any signal', async () => {
    const controllers = [...new Array(5)].map(() => new AbortController());
    const signal = anySignal(...controllers.map((c) => c.signal));

    expect(signal.aborted).toBeFalsy();

    const deferred = createDefer<void>();
    let abortCount = 0;
    signal.addEventListener('abort', () => {
      abortCount += 1;
      deferred.resolve();
    });

    const randomController =
      controllers[Math.floor(Math.random() * controllers.length)];
    randomController.abort();

    await deferred.promise;

    expect(abortCount).toBe(1);
    expect(signal.aborted).toBeTruthy();
  });

  test('ignores non signals', async () => {
    const controllers: any[] = [...new Array(5)].map(
      () => new AbortController()
    );

    const signals = controllers.map((c) => c.signal);

    signals.push(undefined);

    const signal = anySignal(...signals);

    expect(signal.aborted).toBeFalsy();

    const deferred = createDefer<void>();

    let abortCount = 0;
    signal.addEventListener('abort', () => {
      abortCount += 1;
      deferred.resolve();
    });

    const randomController =
      controllers[Math.floor(Math.random() * controllers.length)];
    randomController.abort();

    await deferred.promise;

    expect(abortCount).toBe(1);
    expect(signal.aborted).toBeTruthy();
  });

  test('should only abort once', async () => {
    const controllers = [...new Array(5)].map(() => new AbortController());
    const signal = anySignal(...controllers.map((c) => c.signal));
    expect(signal.aborted).toBeFalsy();
    const deferred = createDefer<void>();
    let abortCount = 0;
    signal.addEventListener('abort', () => {
      abortCount += 1;
      deferred.resolve();
    });

    // Abort all controllers
    for (const controller of controllers) {
      controller.abort();
    }

    await deferred.promise;

    expect(abortCount).toBe(1);
    expect(signal.aborted).toBeTruthy();
  });

  test('should abort if a provided signal is already aborted', () => {
    const controllers = [...new Array(5)].map(() => new AbortController());
    const randomController =
      controllers[Math.floor(Math.random() * controllers.length)];
    randomController.abort();

    const signal = anySignal(...controllers.map((c) => c.signal));

    expect(signal.aborted).toBeTruthy();
  });
});
