import { createQuery } from '@farfetched/core';
import { createQueryResource } from '@farfetched/solid';
import { createEffect } from 'effector';
import { createSignal, For, Show, Suspense } from 'solid-js';
import { render } from 'solid-js/web';

const pokemonsQuery = createQuery({
  effect: createEffect<{ limit: number }, any, TypeError>(({ limit }) =>
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`).then((response) =>
      response.json()
    )
  ),
  mapData: (data: any) => data.results as Array<{ name: string }>,
});

export function App() {
  const { data, start } = createQueryResource(pokemonsQuery);

  const [limit, setLimit] = createSignal(10);

  return (
    <>
      <h1>Pokemon 💙 Farfetched</h1>
      <label>
        Limit:
        <input
          min={1}
          value={limit()}
          type="number"
          onInput={(e) => setLimit(e.currentTarget.valueAsNumber)}
        />
      </label>
      <button onClick={() => start({ limit: limit() })}>Load pokemons</button>
      <Suspense fallback={<p>Loading...</p>}>
        <ol>
          <For each={data()}>{(pokemon) => <li>{pokemon.name}</li>}</For>
        </ol>
      </Suspense>
    </>
  );
}

render(() => <App />, document.getElementById('root') as HTMLElement);
