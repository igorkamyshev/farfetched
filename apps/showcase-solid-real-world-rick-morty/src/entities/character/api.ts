import { TId } from '../../shared/id';

function characterUrl(): string;
function characterUrl({ id }: { id: TId }): string;
function characterUrl({ ids }: { ids: TId[] }): string;

function characterUrl(params?: { id?: TId; ids?: TId[] }) {
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

export { characterUrl };
