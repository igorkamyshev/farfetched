import { createQueryResource } from '@farfetched/solid';
import { For, Suspense, Show, ErrorBoundary } from 'solid-js';
import { Link } from 'atomic-router-solid';

import { LocationDetails } from '../../entities/location';
import {
  currentCharacterQuery,
  currentLocationQuery,
  originQuery,
  characterEpisodesQuery,
} from './model';
import { episodeRoute } from '../episode/model';

function CharacterPage() {
  const [character] = createQueryResource(currentCharacterQuery);
  const [origin] = createQueryResource(originQuery);
  const [currentLocation] = createQueryResource(currentLocationQuery);
  const [episodes] = createQueryResource(characterEpisodesQuery);

  return (
    <Suspense fallback={'Loading ...'}>
      <article>
        <Show when={character()}>
          {(data) => (
            <>
              <h1>{data.name}</h1>
              <img src={data.image} alt={data.name} />
            </>
          )}
        </Show>

        <Suspense fallback="Loading ...">
          <ErrorBoundary fallback={<p>Origin could not be shown</p>}>
            <LocationDetails title="Origin" location={origin()} />
          </ErrorBoundary>
        </Suspense>

        <Suspense fallback="Loading ...">
          <ErrorBoundary fallback={<p>Current location could not be shown</p>}>
            <LocationDetails
              title="Current location"
              location={currentLocation()}
            />
          </ErrorBoundary>
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
