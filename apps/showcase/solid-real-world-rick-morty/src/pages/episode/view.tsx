import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { For, Show } from 'solid-js';

import { characterRoute } from '../../entities/character';
import { charactersInEpisodeQuery, episodeQuery } from './model';

function EpisodePage() {
  const { data: episode, pending: episodePending } =
    createQueryResource(episodeQuery);

  const { data: charactersInEpisode, pending: characterEpisodesPending } =
    createQueryResource(charactersInEpisodeQuery);

  return (
    <Show when={!episodePending()} fallback={'Loading...'}>
      <h1>{episode()?.name}</h1>
      <p>
        {episode()?.episode}, {episode()?.air_date}
      </p>
      <Show when={!characterEpisodesPending()}>
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
      </Show>
    </Show>
  );
}

export { EpisodePage };
