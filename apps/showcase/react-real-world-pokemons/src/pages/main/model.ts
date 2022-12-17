import { createJsonQuery, declareParams } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { Array, Number, Record } from 'runtypes';
import { createGate } from 'effector-react';
import { combine, createStore, sample } from 'effector';

import { pokemonUrl } from '../../entities/pokemon';
import { urlToId } from '../../shared/id';
import { EntityLink } from '../../shared/entity_link';

export const MainPageGate = createGate<{ page: number }>();

const $perPage = createStore(20);

const pokemonListQuery = createJsonQuery({
  params: declareParams<{ page: number }>(),
  request: {
    method: 'GET',
    url: pokemonUrl(),
    query: {
      source: combine({ limit: $perPage }),
      fn: ({ page }, { limit }) => ({ limit, offset: (page - 1) * limit }),
    },
  },
  response: {
    contract: runtypeContract(
      Record({ count: Number, results: Array(EntityLink) })
    ),
    mapData({ result }) {
      return {
        ...result,
        results: result.results.map((result) => ({
          ...result,
          id: urlToId(result.url),
        })),
      };
    },
  },
});

export const $pokemonList = pokemonListQuery.$data.map(
  (response) => response?.results ?? []
);

export const $totalPages = combine(
  { data: pokemonListQuery.$data, perPage: $perPage },
  ({ data, perPage }) => {
    if (!data) return null;

    return Math.round(data.count / perPage);
  }
);

export const $pending = pokemonListQuery.$pending;

sample({ clock: MainPageGate.state, target: pokemonListQuery.start });
