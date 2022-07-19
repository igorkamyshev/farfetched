import { type Query } from '@farfetched/core';
import { useUnit } from 'effector-solid';
import { Accessor, createResource, createSignal } from "solid-js";
import { createEffect, sample } from "effector";

function createQueryResource<Params, Data, Error>(
  query: Query<Params, Data, Error>,
): {
  data: Accessor<Data | null>;
  error: Accessor<Error | null>;
  pending: Accessor<boolean>;
  start: (params: Params) => void;
};

function createQueryResource(query: Query<any, any, any>) {
  const [track, rerun] = createSignal<[] | undefined>(undefined, { equals: false });

  const [data, error, pending, start] = useUnit([
    query.$data,
    query.$error,
    query.$pending,
    query.start,
  ]);

  let defer = createDefer();

  function startResource(args: any) {
    defer = createDefer();
    rerun([]);
    start(args);
  }

  const resolveResourceEffect = createEffect(() => defer.rs({}));

  // Bind to suspense
  const [resourceData] = createResource(track, () => defer.req);

  sample({
    clock: query.done.finally,
    target: resolveResourceEffect,
  });

  const returnedData = () => {
    resourceData();
    return data();
  };

  return { data: returnedData, error, pending, start: startResource };
}

function createDefer(): {
  rs: (value: any) => any
  rj: (value: any) => any
  req: Promise<any>
} {
  const result = {} as {
    rs: (value: any) => any
    rj: (value: any) => any
    req: Promise<any>
  }
  result.req = new Promise((rs, rj) => {
    result.rs = rs
    result.rj = rj
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  result.req.catch(_ => {})
  return result
}

export { createQueryResource };
