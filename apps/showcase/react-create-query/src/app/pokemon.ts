import { createQuery, unkownContract } from '@farfetched/core';
import { createEffect } from 'effector';

const pokemonsQuery = createQuery({
  effect: createEffect(({ limit }: { limit: number }) =>
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`).then((response) =>
      response.json()
    )
  ),
  contract: unkownContract,
  mapData(data: any) {
    return data.results as Array<{ name: string }>;
  },
});

export { pokemonsQuery };
