import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { For, Suspense } from 'solid-js';

import { characterRoute } from '../../entities/character';
import { charactersInEpisodeQuery, episodeQuery } from './model';

function EpisodePage() {
  const [episode] = createQueryResource(episodeQuery);
  const [charactersInEpisode] = createQueryResource(charactersInEpisodeQuery);

  return (
    <Suspense fallback={'Loading...'}>
      <h1>{episode().name}</h1>
      <p>
        {episode().episode}, {episode().air_date}
      </p>
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

export { EpisodePage };
