export function locationUrl(): string;
export function locationUrl({ id }: { id: number }): string;
export function locationUrl({ ids }: { ids: number[] }): string;

export function locationUrl(params?: { id?: number; ids?: number[] }) {
  if (params?.ids) {
    return `https://rickandmortyapi.com/api/location/[${params.ids.join(',')}]`;
  }

  if (params?.id) {
    return `https://rickandmortyapi.com/api/location/${params.id}`;
  }

  return 'https://rickandmortyapi.com/api/location';
}
