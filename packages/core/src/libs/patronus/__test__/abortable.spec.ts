import { is, createEvent, fork, allSettled, scopeBind } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { abortError } from '../../../errors/create_error';
import { abortable } from '../abortable';

describe('lib/effector-abortable', () => {
  test('returns effect', async () => {
    const success = vi.fn();
    const Param = 10;

    const fFx = abortable({
      name: 'fFx',
      effect(params: number) {
        return params;
      },
    });

    fFx.doneData.watch(success);

    const scope = fork();

    await allSettled(fFx, { scope, params: Param });

    expect(is.effect(fFx)).toBe(true);
    expect(success).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith(Param);
  });

  test('aborts effect', async () => {
    const aborted = vi.fn();
    const success = vi.fn();
    const failed = vi.fn();

    const stop = createEvent();
    const fFx = abortable({
      abort: {
        signal: stop,
      },
      name: 'fFx',
      effect(params: number, { onAbort }) {
        return new Promise((res, rej) => {
          const id = setTimeout(res, params);

          onAbort(() => {
            aborted();
            clearTimeout(id);
            rej();
          });
        });
      },
    });

    fFx.watch(() => {
      const stopScoped = scopeBind(stop);
      setTimeout(stopScoped);
    });
    fFx.done.watch(() => success());
    fFx.failData.watch(failed);

    const scope = fork();

    await allSettled(fFx, { scope, params: 10 });

    expect(aborted).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledTimes(0);
    expect(failed.mock.calls[0][0]).toEqual(abortError());
  });

  test('multiple abort hooks', async () => {
    const aborted = vi.fn();
    const success = vi.fn();
    const aborted2 = vi.fn();

    const stop = createEvent();
    const fFx = abortable({
      abort: {
        signal: stop,
      },
      name: 'fFx',
      effect(params: number, { onAbort }) {
        return new Promise((res, rej) => {
          const id = setTimeout(res, params);

          onAbort(() => {
            aborted2();
          });

          onAbort(() => {
            aborted();
            clearTimeout(id);
            rej();
          });
        });
      },
    });

    fFx.watch(() => {
      const stopScoped = scopeBind(stop);
      setTimeout(stopScoped);
    });
    fFx.done.watch(() => success());

    const scope = fork();

    await allSettled(fFx, { scope, params: 10 });

    expect(aborted).toHaveBeenCalledTimes(1);
    expect(aborted2).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledTimes(0);
  });

  test('multiple abort hooks', async () => {
    const aborted = vi.fn();
    const success = vi.fn();
    const aborted2 = vi.fn();

    const stop = createEvent();
    const fFx = abortable({
      abort: {
        signal: stop,
      },
      name: 'fFx',
      effect(params: number, { onAbort }) {
        return new Promise((res, rej) => {
          const id = setTimeout(res, params);

          const dispose = onAbort(() => {
            aborted2();
          });

          dispose();

          onAbort(() => {
            aborted();
            clearTimeout(id);
            rej();
          });
        });
      },
    });

    fFx.watch(() => {
      const stopScoped = scopeBind(stop);
      setTimeout(stopScoped);
    });
    fFx.done.watch(() => success());

    const scope = fork();

    await allSettled(fFx, { scope, params: 10 });

    expect(aborted).toHaveBeenCalledTimes(1);
    expect(aborted2).toHaveBeenCalledTimes(0);
    expect(success).toHaveBeenCalledTimes(0);
  });

  test('does not affect other scope', async () => {
    const ALLOWED_PARAM = 10;
    const aborted = vi.fn();
    const success = vi.fn();
    const failed = vi.fn();

    const stop = createEvent();
    const fFx = abortable({
      abort: {
        signal: stop,
      },
      name: 'fFx',
      effect(params: number, { onAbort }) {
        return new Promise((res, rej) => {
          const id = setTimeout(res, params);

          onAbort(() => {
            aborted();
            clearTimeout(id);
            rej();
          });
        });
      },
    });

    fFx.watch((params) => {
      if (params !== ALLOWED_PARAM) {
        const stopScoped = scopeBind(stop);
        setTimeout(stopScoped);
      }
    });
    fFx.done.watch(({ params }) => success(params));
    fFx.fail.watch(({ params }) => failed(params));

    await Promise.all([
      allSettled(fFx, { scope: fork(), params: ALLOWED_PARAM }),
      allSettled(fFx, { scope: fork(), params: 3 }),
      allSettled(fFx, { scope: fork(), params: ALLOWED_PARAM }),
      allSettled(fFx, { scope: fork(), params: 15 }),
      allSettled(fFx, { scope: fork(), params: ALLOWED_PARAM }),
    ]);

    expect(aborted).toHaveBeenCalledTimes(2);
    expect(failed.mock.calls.map(([arg]) => arg)).toEqual([3, 15]);
    expect(success.mock.calls.map(([arg]) => arg)).toEqual([10, 10, 10]);
  });

  test('multiple unwatch calls does not affect other hooks', async () => {
    const aborted = vi.fn();
    const aborted2 = vi.fn();
    const aborted3 = vi.fn();

    const stop = createEvent();
    const fFx = abortable({
      abort: {
        signal: stop,
      },
      name: 'fFx',
      effect(params: number, { onAbort }) {
        return new Promise((res, rej) => {
          const id = setTimeout(res, params);

          const unwatch = onAbort(() => {
            aborted2();
          });

          onAbort(() => {
            aborted3();
          });

          onAbort(() => {
            aborted();
            clearTimeout(id);
            rej();
          });

          unwatch();
          unwatch();
          unwatch();
        });
      },
    });

    fFx.watch(() => {
      setTimeout(scopeBind(stop));
    });

    const scope = fork();

    await allSettled(fFx, { scope, params: 10 });

    expect(aborted2).toHaveBeenCalledTimes(0);
    expect(aborted).toHaveBeenCalledTimes(1);
    expect(aborted3).toBeCalledTimes(1);
  });
});
