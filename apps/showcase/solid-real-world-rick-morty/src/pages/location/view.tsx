import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { For, Show } from 'solid-js';

import { characterRoute } from '../../entities/character';
import { locationQuery, residentsQuery } from './model';

function LocationPage() {
  const { data: location, pending: locationPending } =
    createQueryResource(locationQuery);

  const { data: residents, pending: residentsPending } =
    createQueryResource(residentsQuery);

  return (
    <Show when={!locationPending()} fallback={'Loading ...'}>
      <h1>{location()?.name}</h1>
      <p>Type: {location()?.type}</p>
      <p>Dimension: {location()?.dimension}</p>

      <Show when={!residentsPending()}>
        <h2>Residents</h2>
        <ul>
          <For each={residents()}>
            {(resident) => (
              <li>
                <Link to={characterRoute} params={{ characterId: resident.id }}>
                  {resident.name}
                </Link>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </Show>
  );
}
export { LocationPage };
