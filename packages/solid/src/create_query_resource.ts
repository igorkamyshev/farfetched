import { useUnit } from 'effector-solid';
import {
  createResource,
  createSignal,
  Resource,
  createComputed,
} from 'solid-js';
import { type Query } from '@farfetched/core';

import { createDefer } from './defer';

function createQueryResource<Params, Data, Error>(
  query: Query<Params, Data, Error>
): [
  Resource<Data | undefined>,
  {
    /**
     * @deprecated use `start` instead
     */
    refetch: (params: Params) => void;
    start: (params: Params) => void;
  }
] {
  const [track, rerun] = createSignal<[] | undefined>(undefined, {
    equals: false,
  });

  const { data, error, pending, start } = useUnit(query);

  let dataDefer = createDefer<Data, Error>();

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
      dataDefer.reject(currentError);
    }
  });

  // Bind to suspense
  const [resourceData] = createResource(track, () => dataDefer.promise);

  return [resourceData, { refetch: start, start }];
}

export { createQueryResource };
