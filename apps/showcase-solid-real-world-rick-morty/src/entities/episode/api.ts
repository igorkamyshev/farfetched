export function episodeUrl(): string;
export function episodeUrl({ id }: { id: number }): string;
export function episodeUrl({ ids }: { ids: number[] }): string;

export function episodeUrl(params?: { id?: number; ids?: number[] }) {
  if (params?.ids) {
    return `https://rickandmortyapi.com/api/episode/[${params.ids.join(',')}]`;
  }

  if (params?.id) {
    return `https://rickandmortyapi.com/api/episode/${params.id}`;
  }

  return 'https://rickandmortyapi.com/api/episode';
}
