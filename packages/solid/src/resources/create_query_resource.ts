import { type Query } from '@farfetched/core';
import { useUnit } from 'effector-solid';
import {
  createResource,
  createSignal,
  createEffect as createSolidEffect,
} from 'solid-js';
import { createEffect as createEffectorEffect, sample } from 'effector';

const skippedMark = '__SKIPPED__' as const;

function createQueryResource<Params, Data, Error>(
  query: Query<Params, Data, Error>
) {
  const [track, rerun] = createSignal<[] | undefined>(undefined, {
    equals: false,
  });

  const [pending, start] = useUnit([query.$pending, query.start]);

  let dataDefer = createDefer();

  // Start Resource after Query state changes
  createSolidEffect(() => {
    const isPending = pending();

    if (isPending) {
      dataDefer = createDefer();
      rerun([]);
    }
  });

  const resolveResourceFx = createEffectorEffect((data: Data) => {
    dataDefer.rs(data);
  });
  const rejectResourceFx = createEffectorEffect(
    (error: Error | typeof skippedMark) => {
      dataDefer.rj(error);
    }
  );

  // Bind to suspense
  const [resourceData] = createResource<Data, Params>(
    track as any,
    (_params: Params) => dataDefer.req
  );

  sample({ clock: query.done.success, target: resolveResourceFx });
  sample({ clock: query.done.error, target: rejectResourceFx });
  sample({
    clock: query.done.skip,
    fn: () => skippedMark,
    target: rejectResourceFx,
  });

  return [resourceData, { refetch: start }] as const;
}

function createDefer(): {
  rs: (value: any) => any;
  rj: (value: any) => any;
  req: Promise<any>;
} {
  const result = {} as {
    rs: (value: any) => any;
    rj: (value: any) => any;
    req: Promise<any>;
  };
  result.req = new Promise((rs, rj) => {
    result.rs = rs;
    result.rj = rj;
  });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  result.req.catch((_) => {});
  return result;
}

export { createQueryResource, createDefer };
