import {
  connectQuery,
  createJsonQuery,
  declareParams,
  linearDelay,
  retry,
} from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { createGate } from 'effector-react';
import { combine, sample } from 'effector';

import {
  Pokemon,
  pokemonUrl,
  Species,
  speciesUrl,
} from '../../entities/pokemon';
import { TId, urlToId } from '../../shared/id';

export const PokemonPageGate = createGate<{ id: number }>();

const pokemonQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    method: 'GET',
    url: ({ id }) => pokemonUrl({ id }),
  },
  response: {
    contract: runtypeContract(Pokemon),
    mapData({ result: { sprites, ...data } }) {
      return {
        ...data,
        avatarUrl: sprites.front_default,
      };
    },
  },
});

const speciesQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    method: 'GET',
    url: ({ id }) => speciesUrl({ id }),
  },
  response: {
    contract: runtypeContract(Species),
  },
});

retry(speciesQuery, { times: 2, delay: linearDelay(1000) });

export const $pending = pokemonQuery.$pending;
export const $pokemon = combine(
  { pokemon: pokemonQuery.$data, species: speciesQuery.$data },
  ({ pokemon, species }) => ({ ...pokemon, color: species?.color.name ?? null })
);

sample({
  clock: PokemonPageGate.state,
  filter: (params) => Boolean(params.id),
  fn: ({ id }) => ({ id } as { id: TId }),
  target: pokemonQuery.start,
});

connectQuery({
  source: pokemonQuery,
  fn: ({ result: pokemon }) => ({
    params: { id: urlToId(pokemon.species.url) },
  }),
  target: speciesQuery,
});
