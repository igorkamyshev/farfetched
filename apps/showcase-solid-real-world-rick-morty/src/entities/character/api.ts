export function characterUrl(): string;
export function characterUrl({ id }: { id: number }): string;
export function characterUrl({ ids }: { ids: number[] }): string;

export function characterUrl(params?: { id?: number; ids?: number[] }) {
  if (params?.ids) {
    return `https://rickandmortyapi.com/api/character/[${params.ids.join(
      ','
    )}]`;
  }

  if (params?.id) {
    return `https://rickandmortyapi.com/api/character/${params.id}`;
  }

  return 'https://rickandmortyapi.com/api/character';
}
