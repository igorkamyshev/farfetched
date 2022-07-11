import { useState } from 'react';
import { useStore } from 'effector-react';

import { pokemonsQuery } from './pokemon';
import styles from './app.module.css';

export function App() {
  const pokemons = useStore(pokemonsQuery.$data);
  const loading = useStore(pokemonsQuery.$pending);

  const [limit, setLimit] = useState(10);

  return (
    <>
      <h1>Pokemon list</h1>
      <label>
        Limit:
        <input
          value={limit}
          type="number"
          onChange={(e) => setLimit(e.target.valueAsNumber)}
        ></input>
        <button onClick={() => pokemonsQuery.start({ limit })}>
          Request pokemons
        </button>
      </label>
      {loading && <p>Loading...</p>}
      <ol>{pokemons && pokemons.map((pokemon) => <li>{pokemon.name}</li>)}</ol>
    </>
  );
}

export default App;
