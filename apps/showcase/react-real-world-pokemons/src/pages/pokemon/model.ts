import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { createGate } from 'effector-react';
import { sample } from 'effector';

import { Pokemon } from '../../entities/pokemon';

export const PokemonPageGate = createGate<{ id: number }>();

export const pokemonQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: 'GET',
    url: ({ id }) => `https://pokeapi.co/api/v2/pokemon/${id}`,
  },
  response: {
    contract: runtypeContract(Pokemon),
  },
});

sample({
  clock: PokemonPageGate.state,
  filter: (params) => Boolean(params.id),
  target: pokemonQuery.start,
});
