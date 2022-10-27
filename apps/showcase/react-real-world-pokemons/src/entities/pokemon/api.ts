import { TId } from '../../shared/id';

function pokemonUrl(): string;
function pokemonUrl({ id }: { id: TId }): string;

function pokemonUrl(params?: { id: TId }) {
  if (params?.id) {
    return `https://pokeapi.co/api/v2/pokemon/${params.id}`;
  }

  return 'https://pokeapi.co/api/v2/pokemon';
}

function speciesUrl(): string;
function speciesUrl({ id }: { id: TId }): string;

function speciesUrl(params?: { id: TId }) {
  if (params?.id) {
    return `https://pokeapi.co/api/v2/pokemon-species/${params.id}`;
  }

  return 'https://pokeapi.co/api/v2/pokemon-species';
}

export { pokemonUrl, speciesUrl };
