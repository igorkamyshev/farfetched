import { createQueryResource } from '@farfetched/solid';
import { For, Show } from 'solid-js';
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
  const { data: character, pending: characterPending } =
    createQueryResource(characterQuery);

  const { data: origin, pending: originPending } =
    createQueryResource(originQuery);

  const { data: currentLocation, pending: currentLocationPending } =
    createQueryResource(currentLocationQuery);

  const { data: episodes, pending: episodesPending } = createQueryResource(
    characterEpisodesQuery
  );

  return (
    <Show when={!characterPending()} fallback={'Loading ...'}>
      <article>
        <h1>{character()?.name}</h1>

        <img src={character()?.image} alt={character()?.name} />

        <section>
          <h2>Origin: {character()?.origin.name}</h2>
          <LocationDetails pending={originPending()} location={origin()} />
        </section>

        <section>
          <h2>Current location: {character()?.location.name}</h2>
          <LocationDetails
            pending={currentLocationPending()}
            location={currentLocation()}
          />
        </section>

        <Show when={!episodesPending()}>
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
        </Show>
      </article>
    </Show>
  );
}

export { CharacterPage };
