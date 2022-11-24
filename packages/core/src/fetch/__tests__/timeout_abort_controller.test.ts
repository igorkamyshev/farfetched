import { setTimeout } from 'timers/promises';
import { describe, test, expect, vi } from 'vitest';

import { TimeoutController } from '../timeout_abort_controller';

describe('TimeoutController', () => {
  test('aborts when the timer expires', async () => {
    const timeoutController = new TimeoutController(50);

    const onAbort = vi.fn();

    timeoutController.signal.addEventListener('abort', onAbort);

    await setTimeout(70);
    expect(timeoutController.signal.aborted).toBeTruthy();
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  test('can be manually aborted', async () => {
    const timeoutController = new TimeoutController(50);

    const onAbort = vi.fn();

    timeoutController.signal.addEventListener('abort', onAbort);

    timeoutController.abort();

    await setTimeout(70);

    expect(timeoutController.signal.aborted).toBeTruthy();
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  test('can clear the timeout', async () => {
    const timeoutController = new TimeoutController(50);

    timeoutController.clear();
    await setTimeout(70);

    expect(timeoutController.signal.aborted).toBeFalsy();
  });
});
