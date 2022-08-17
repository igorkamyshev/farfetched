import { createQueryResource } from '@farfetched/solid';
import { For, Suspense } from 'solid-js';
import { Link } from 'atomic-router-solid';

import { LocationDetails } from '../../entities/location';
import {
  characterQuery,
  currentLocationQuery,
  originQuery,
  characterEpisodesQuery,
} from './model';
import { episodeRoute } from '../episode/model';

function CharacterPage() {
  const [character] = createQueryResource(characterQuery);
  const [origin] = createQueryResource(originQuery);
  const [currentLocation] = createQueryResource(currentLocationQuery);
  const [episodes] = createQueryResource(characterEpisodesQuery);

  return (
    <Suspense fallback={'Loading ...'}>
      <article>
        <h1>{character().name}</h1>

        <img src={character().image} alt={character()?.name} />

        <Suspense fallback="Loading ...">
          <LocationDetails title="Origin" location={origin()} />
        </Suspense>

        <Suspense fallback="Loading ...">
          <LocationDetails
            title="Current location"
            location={currentLocation()}
          />
        </Suspense>

        <Suspense fallback="Loading ...">
          <section>
            <h2>Espisodes</h2>
            <ul>
              <For each={episodes()}>
                {(episode) => (
                  <li>
                    <Link to={episodeRoute} params={{ episodeId: episode.id }}>
                      {episode.name}
                    </Link>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </Suspense>
      </article>
    </Suspense>
  );
}

export { CharacterPage };
