import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { For, Show, Suspense } from 'solid-js';

import { characterRoute } from '../../entities/character';
import { currentLocationQuery, residentsQuery } from './model';

function LocationPage() {
  const [location] = createQueryResource(currentLocationQuery);
  const [residents] = createQueryResource(residentsQuery);

  return (
    <Suspense fallback={'Loading ...'}>
      <Show when={location()}>
        {(data) => (
          <>
            <h1>{data.name}</h1>
            <p>Type: {data.type}</p>
            <p>Dimension: {data.dimension}</p>
          </>
        )}
      </Show>

      <Suspense fallback={'Loading ...'}>
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
      </Suspense>
    </Suspense>
  );
}
export { LocationPage };
