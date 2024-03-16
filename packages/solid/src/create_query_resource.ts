import { useUnit } from 'effector-solid';
import {
  createResource,
  createSignal,
  Resource,
  createComputed,
} from 'solid-js';
import { type Query } from '@farfetched/core';

import { createDefer } from './defer';

function createQueryResource<Params, Data, QueryError>(
  query: Query<Params, Data, QueryError>
): [
  Resource<Data | undefined>,
  {
    start: (params: Params) => void;
  },
] {
  const [track, rerun] = createSignal<[] | undefined>(undefined, {
    equals: false,
  });

  const { data, error, pending, start } = useUnit(query);

  let dataDefer = createDefer<Data, QueryError & Error>();

  createComputed(() => {
    // Start Resource after Query state changes
    if (pending() || data()) {
      dataDefer = createDefer();
      rerun([]);
    }

    // Resolve Resource after Query returns data
    const currentData = data();
    if (currentData !== null && !pending()) {
      dataDefer.resolve(currentData);
    }

    // Reject Resource after Query returns error
    const currentError = error();
    if (currentError !== null) {
      /*
      SolidJS introduced a breaking change in 1.5 — https://github.com/solidjs/solid/pull/1176
      Since we can't pass plain objects (which are used to make errors serializable) to `reject`
      So, we have to convert them to `Error` instances for SolidJS
      */
      if (currentError instanceof Error || typeof currentError === 'string') {
        dataDefer.reject(currentError as any);
      } else {
        const errorForSolid = new Error((currentError as any)?.message);

        if (typeof currentError === 'object') {
          Object.assign(errorForSolid, currentError);
        }

        dataDefer.reject(errorForSolid as any);
      }
    }
  });

  // Bind to suspense
  const [resourceData] = createResource(track, () => dataDefer.promise);

  return [resourceData, { start }];
}

export { createQueryResource };
