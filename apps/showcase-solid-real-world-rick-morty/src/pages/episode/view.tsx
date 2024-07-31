import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { For, Show, Suspense } from 'solid-js';

import { characterRoute } from '../../entities/character';
import { charactersInEpisodeQuery, curentEpisodeQuery } from './model';

export function EpisodePage() {
  const [episode] = createQueryResource(curentEpisodeQuery);
  const [charactersInEpisode] = createQueryResource(charactersInEpisodeQuery);

  return (
    <Suspense fallback={'Loading...'}>
      <Show when={episode()}>
        {(data) => (
          <>
            <h1>{data.name}</h1>
            <p>
              {data.episode}, {data.air_date}
            </p>
          </>
        )}
      </Show>

      <Suspense fallback={'Loading...'}>
        <h2>Characters in episode:</h2>
        <ul>
          <For each={charactersInEpisode()}>
            {(character) => (
              <li>
                <Link
                  to={characterRoute}
                  params={{ characterId: character.id }}
                >
                  {character.name}
                </Link>
              </li>
            )}
          </For>
        </ul>
      </Suspense>
    </Suspense>
  );
}
