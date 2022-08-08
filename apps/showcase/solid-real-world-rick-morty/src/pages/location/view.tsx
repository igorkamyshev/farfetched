import { createQueryResource } from '@farfetched/solid';
import { Show } from 'solid-js';

import { locationQuery } from '../../entities/location';

function LocationPage() {
  const { data, pending } = createQueryResource(locationQuery);
  return (
    <Show when={!pending()} fallback={'Loading ...'}>
      <h1>{data()?.name}</h1>
    </Show>
  );
}
export { LocationPage };
