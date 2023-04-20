import { allSettled, createEvent, fork } from 'effector';
import { setTimeout } from 'timers/promises';
import { describe, test, vi, expect } from 'vitest';

import { createQuery } from '../create_query';

describe('createQuery#concurrency', () => {
  describe('abort', () => {
    test('call onAbort callback of handler', async () => {
      const abortCallback = vi.fn();
      const handler = vi.fn(async (_: void, { onAbort }) => {
        onAbort(abortCallback);

        await setTimeout(100);

        return null;
      });

      const signal = createEvent();

      const query = createQuery({
        handler,
        concurrency: { abort: signal },
      });

      const scope = fork();

      await allSettled(query.start, { scope });
      expect(handler).toBeCalledTimes(1);
      expect(abortCallback).not.toBeCalled();

      allSettled(query.start, { scope });
      allSettled(signal, { scope });

      await allSettled(scope);

      expect(handler).toBeCalledTimes(2);
      expect(abortCallback).toBeCalledTimes(1);
    });
  });

  //   describe('strategy', () => {});
});
