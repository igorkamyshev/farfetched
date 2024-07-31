import {
  concurrency,
  connectQuery,
  createJsonQuery,
  declareParams,
} from '@farfetched/core';
import { createGate } from 'effector-react';
import { combine, sample } from 'effector';

import {
  Pokemon,
  pokemonUrl,
  Species,
  speciesUrl,
} from '../../entities/pokemon';
import { urlToId } from '../../shared/id';

export const PokemonPageGate = createGate<{ id: number }>();

const pokemonQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: 'GET',
    url: ({ id }) => pokemonUrl({ id }),
  },
  response: {
    contract: Pokemon,
    mapData({ result: { sprites, ...data } }) {
      return {
        ...data,
        avatarUrl: sprites.front_default,
      };
    },
  },
});

concurrency(pokemonQuery, { strategy: 'TAKE_LATEST' });

const speciesQuery = createJsonQuery({
  params: declareParams<{ id: string }>(),
  request: {
    method: 'GET',
    url: ({ id }) => speciesUrl({ id }),
  },
  response: {
    contract: Species,
  },
});

concurrency(speciesQuery, { strategy: 'TAKE_LATEST' });

export const $pending = pokemonQuery.$pending;
export const $pokemon = combine(
  { pokemon: pokemonQuery.$data, species: speciesQuery.$data },
  ({ pokemon, species }) => ({ ...pokemon, color: species?.color.name ?? null })
);

sample({
  clock: PokemonPageGate.state,
  filter: (params) => Boolean(params.id),
  fn: ({ id }) => ({ id }),
  target: pokemonQuery.start,
});

connectQuery({
  source: pokemonQuery,
  fn: ({ result: pokemon }) => ({
    params: { id: urlToId(pokemon.species.url) },
  }),
  target: speciesQuery,
});
