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
    return (data.results as Array<any>).map((pokemon) => {
      const id = pokemon.url.split('/').filter(Boolean).pop();

      return {
        name: pokemon.name as string,
        url: pokemon.url as string,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    });
  },
});

export { pokemonsQuery };
