import { TId } from '../../shared/id';

function pokemonUrl(): string;
function pokemonUrl({ id }: { id: TId }): string;

function pokemonUrl(params?: { id: TId }) {
  if (params?.id) {
    return `https://pokeapi.co/api/v2/pokemon/${params.id}`;
  }

  return 'https://pokeapi.co/api/v2/pokemon';
}

export { pokemonUrl };
