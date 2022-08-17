import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { For, Suspense } from 'solid-js';

import { characterRoute } from '../../entities/character';
import { locationQuery, residentsQuery } from './model';

function LocationPage() {
  const [location] = createQueryResource(locationQuery);
  const [residents] = createQueryResource(residentsQuery);

  return (
    <Suspense fallback={'Loading ...'}>
      <h1>{location().name}</h1>
      <p>Type: {location().type}</p>
      <p>Dimension: {location().dimension}</p>

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
