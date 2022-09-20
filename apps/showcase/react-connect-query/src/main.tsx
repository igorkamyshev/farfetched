import { Record, String, Static } from 'runtypes';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { useQuery } from '@farfetched/react';
import { runtypeContract } from '@farfetched/runtypes';

const Character = Record({ name: String, location: Record({ url: String }) });
const Location = Record({ name: String, type: String });

type Character = Static<typeof Character>;
type Location = Static<typeof Location>;

interface CharacterQueryParams {
  id: number;
}

const characterQuery = createJsonQuery({
  // ID will be passed as parameter of Query
  params: declareParams<CharacterQueryParams>(),
  request: {
    method: 'GET',
    // Let's pass the ID to final URL
    url: ({ id }) => `https://rickandmortyapi.com/api/character/${id}`,
  },
  response: {
    // We expect that response will be a Character object
    contract: runtypeContract(Character),
  },
});

const locationQuery = createJsonQuery({
  // URL will be passed as parameter of the Query
  params: declareParams<{ locationUrl: string }>(),
  request: {
    method: 'GET',
    // Let's use passed URL as a final URL of the Query
    url: ({ locationUrl }) => locationUrl,
  },
  response: {
    // We expect that response will be a Location object
    contract: runtypeContract(Location),
  },
});

let newConnectQuery: any;

// Character with location inside
const characterInfoQuery = newConnectQuery(
  {
    // We need information from characterQuery before locationQuery execution
    source: characterQuery,
    // get location URL from it
    // we can pass queryParams if we want
    fn(character: Character, queryParams: CharacterQueryParams) {
      return { params: { locationUrl: character.location.url } };
    },
    // and start locationQuery with it
    target: locationQuery,
  },
  (character: Character, location: Location) => ({
    name: character.name,
    location,
  })
);

function useCharacterInfoQueryTogether() {
  // We combine all queries together so now we can't show
  // separate data for character and location for case
  // where character is loaded but location is still in progress.
  // So that hook will be used for cases with coalescing data.
  const {
    start: loadCharacterInfo,
    pending,
    data,
  } = useQuery(characterInfoQuery);
}

function App() {
  const { pending: characterPending, data: character } =
    useQuery(characterQuery);

  const {
    pending: locationLoading,
    stale: locationIsStale,
    data: location,
  } = useQuery(locationQuery);

  // For cases where you need to show intermediate queries results and statuses,
  // you can use combined query as trigger.
  // Now it's easier to understand from the code that happening.
  // You see that loadCharacterInfo is using.
  // So you can navigate to characterInfoQuery declaration in your IDE and see relation description.
  const { start: loadCharacterInfo } = useQuery(characterInfoQuery);

  return (
    <>
      <h1>Rick, Morty and Farfetched</h1>
      <button
        onClick={() =>
          loadCharacterInfo({ id: Math.round(Math.random() * 100) })
        }
      >
        Load random character
      </button>
      <section>
        <h2>Character</h2>
        {characterPending && <p>Loading...</p>}
        {character && <p>{character.name}</p>}
        {!character && !characterPending && <p>No character</p>}
      </section>
      <section>
        <h2>Location</h2>
        {locationIsStale && location && <p>Wow, it is an old location!</p>}
        {locationLoading && <p>Loading...</p>}
        {!locationIsStale && location && (
          <p>
            {location.name} ({location.type})
          </p>
        )}
        {!location && !locationLoading && <p>No location</p>}
      </section>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
