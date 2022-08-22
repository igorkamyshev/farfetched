import { type Query } from '@farfetched/core';
import { createDefer } from '@farfetched/misc';
import { useUnit } from 'effector-solid';
import {
  createResource,
  createSignal,
  createEffect as createSolidEffect,
  Resource,
} from 'solid-js';
import { createEffect as createEffectorEffect, sample } from 'effector';

const skippedMark = '__SKIPPED__' as const;

function createQueryResource<Params, Data, Error>(
  query: Query<Params, Data, Error>
): [Resource<Data | undefined>, { refetch: (params: Params) => void }] {
  const [track, rerun] = createSignal<[] | undefined>(undefined, {
    equals: false,
  });

  const [pending, start] = useUnit([query.$pending, query.start]);

  let dataDefer = createDefer<Data, Error | typeof skippedMark>();

  // Start Resource after Query state changes
  createSolidEffect(() => {
    const isPending = pending();

    if (isPending) {
      dataDefer = createDefer();
      rerun([]);
    }
  });

  const resolveResourceFx = createEffectorEffect((data: Data) => {
    dataDefer.resolve(data);
  });
  const rejectResourceFx = createEffectorEffect(
    (error: Error | typeof skippedMark) => {
      dataDefer.reject(error);
    }
  );

  // Bind to suspense
  const [resourceData] = createResource(track, () => dataDefer.promise);

  sample({
    clock: query.finished.success,
    fn: ({ data }) => data,
    target: resolveResourceFx,
  });
  sample({
    clock: query.finished.failure,
    fn: ({ error }) => error,
    target: rejectResourceFx,
  });
  sample({
    clock: query.finished.skip,
    fn: () => skippedMark,
    target: rejectResourceFx,
  });

  return [resourceData, { refetch: start }];
}

export { createQueryResource };
