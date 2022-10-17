import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { createGate } from 'effector-react';
import { sample } from 'effector';

import { Pokemon, pokemonUrl } from '../../entities/pokemon';
import { TId } from '../../shared/id';

export const PokemonPageGate = createGate<{ id: number }>();

export const pokemonQuery = createJsonQuery({
  params: declareParams<{ id: TId }>(),
  request: {
    method: 'GET',
    url: ({ id }) => pokemonUrl({ id }),
  },
  response: {
    contract: runtypeContract(Pokemon),
    mapData: ({ sprites, ...data }) => ({
      ...data,
      avatarUrl: sprites.front_default,
    }),
  },
});

sample({
  clock: PokemonPageGate.state,
  filter: (params) => Boolean(params.id),
  fn: ({ id }) => ({ id } as { id: TId }),
  target: pokemonQuery.start,
});
