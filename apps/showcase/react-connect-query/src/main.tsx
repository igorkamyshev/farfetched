import { Record, String } from 'runtypes';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { connectQuery, createJsonQuery, declareParams } from '@farfetched/core';
import { useQuery } from '@farfetched/react';
import { runtypeContract } from '@farfetched/runtypes';

const Character = Record({ name: String, location: Record({ url: String }) });
const Location = Record({ name: String, type: String });

const characterQuery = createJsonQuery({
  // ID will be passed as parameter of Query
  params: declareParams<{ id: number }>(),
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

connectQuery({
  // Right after characterQuery is successfully finished
  source: { character: characterQuery },
  // get location URL from it
  fn({ character }) {
    return { params: { locationUrl: character.location.url } };
  },
  // and start locationQuery with it
  target: locationQuery,
});

function App() {
  const {
    start: loadCharacter,
    pending: characterPending,
    data: character,
  } = useQuery(characterQuery);

  const {
    pending: locationLoading,
    stale: locationIsStale,
    data: location,
  } = useQuery(locationQuery);

  return (
    <>
      <h1>Rick, Morty and Farfetched</h1>
      <button
        onClick={() => loadCharacter({ id: Math.round(Math.random() * 100) })}
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
