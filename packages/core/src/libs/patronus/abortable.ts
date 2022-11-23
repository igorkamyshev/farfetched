import {
  Unit,
  Effect,
  createApi,
  sample,
  scopeBind,
  createStore,
  createEffect,
} from 'effector';
import { createDefer, Defer } from '@farfetched/misc';

import { abortError } from '../../errors/create_error';
import { AbortError } from '../../errors/type';

let count = 0;
const getId = () => {
  count += 1;
  return count;
};

const createAborter = () => {
  let handlers: (() => void)[] = [];

  const onAbort = (fn: () => void) => {
    handlers.push(fn);

    return () => {
      const idx = handlers.findIndex((f) => f === fn);
      if (idx > -1) {
        handlers.splice(idx, 1);
      }
    };
  };

  const runAborters = () => {
    handlers.forEach((f) => f());
    handlers = [];
  };

  return {
    runAborters,
    onAbort,
  };
};

type Call<R, F> = Defer<R, F> & {
  context: {
    runAborters?: ReturnType<typeof createAborter>['runAborters'];
  };
};

const createCall = <R, F>(ctx: any) => {
  const def = createDefer() as Call<R, F>;
  def.context = ctx;
  return def;
};

export type AbortConfig = {
  signal: Unit<any>;
};

export interface AbortContext {
  onAbort(cb: () => void): () => void;
}

export function abortable<P = void, D = void, F = Error>(config: {
  name?: string;
  abort?: AbortConfig;
  effect(p: P, ctx: AbortContext): D | Promise<D>;
}): Effect<P, D, F | AbortError> {
  const { abort, effect } = config;

  type CurrentCall = Call<D, F | AbortError>;

  const runCallFx = createEffect(async (def: CurrentCall) => {
    const result = await def.promise;

    return result;
  });
  const $calls = createStore<CurrentCall[]>([], { serialize: 'ignore' });
  const callsApi = createApi($calls, {
    add(calls, def: CurrentCall) {
      return [...calls, def];
    },
    remove(calls, def: CurrentCall) {
      return calls.filter((d) => d !== def);
    },
  });

  if (abort?.signal) {
    const abortTrigger = sample({ clock: abort.signal });

    $calls.watch(abortTrigger, (calls) => {
      calls.forEach((c) => {
        c.context?.runAborters?.();
        c.reject(abortError());
      });
    });
  }

  // нужно, чтобы поддержать и синхронные эффекты тоже
  const handler = async (...args: Parameters<typeof effect>) => effect(...args);

  const runnerFx = createEffect<P, D, F | AbortError>({
    name: config.name ?? 'runnerFx',
    sid: (config.name ?? 'runnerFx') + getId(),
    handler: async (p: P) => {
      const { runAborters, onAbort } = createAborter();
      const call = createCall<D, F | AbortError>({ runAborters });

      callsApi.add(call);

      let boundApiRemove: (def: CurrentCall) => void;
      try {
        boundApiRemove = scopeBind(callsApi.remove);
      } catch (e) {
        boundApiRemove = callsApi.remove;
      }

      handler(p, { onAbort })
        .then(call.resolve)
        .catch(call.reject)
        .finally(() => boundApiRemove(call));

      const result = await runCallFx(call);

      return result;
    },
  });

  return runnerFx;
}
