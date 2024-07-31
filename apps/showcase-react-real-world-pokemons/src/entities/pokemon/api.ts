export function pokemonUrl(): string;
export function pokemonUrl({ id }: { id: number }): string;

export function pokemonUrl(params?: { id: number }) {
  if (params?.id) {
    return `https://pokeapi.co/api/v2/pokemon/${params.id}`;
  }

  return 'https://pokeapi.co/api/v2/pokemon';
}

export function speciesUrl(): string;
export function speciesUrl({ id }: { id: number }): string;

export function speciesUrl(params?: { id: number }) {
  if (params?.id) {
    return `https://pokeapi.co/api/v2/pokemon-species/${params.id}`;
  }

  return 'https://pokeapi.co/api/v2/pokemon-species';
}
