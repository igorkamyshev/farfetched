import { createQueryResource } from '@farfetched/solid';
import { Show } from 'solid-js';
import { Link } from 'atomic-router-solid';

import {
  characterQuery,
  currentLocationQuery,
  originQuery,
} from '../../entities/character';
import { LocationDetails } from '../../entities/location';
import { mainRoute } from '../main';
import { locationRoute } from '../location';

function CharacterPage() {
  const { data: character, pending: characterPending } =
    createQueryResource(characterQuery);

  const { data: origin, pending: originPending } =
    createQueryResource(originQuery);

  const { data: currentLocation, pending: currentLocationPending } =
    createQueryResource(currentLocationQuery);

  return (
    <>
      <Link to={mainRoute}>Main page</Link>
      <Show when={!characterPending()} fallback={'Loading ...'}>
        <article>
          <h1>{character()?.name}</h1>

          <img src={character()?.image} alt={character()?.name} />

          <section>
            <h2>Origin: {character()?.origin.name}</h2>
            <LocationDetails
              pending={originPending()}
              location={origin()}
              route={locationRoute}
            />
          </section>

          <section>
            <h2>Current location: {character()?.location.name}</h2>
            <LocationDetails
              pending={currentLocationPending()}
              location={currentLocation()}
              route={locationRoute}
            />
          </section>
        </article>
      </Show>
    </>
  );
}

export { CharacterPage };
