import { TId } from '../../shared/id';

function locationUrl(): string;
function locationUrl({ id }: { id: TId }): string;
function locationUrl({ ids }: { ids: TId[] }): string;

function locationUrl(params?: { id?: TId; ids?: TId[] }) {
  if (params?.ids) {
    return `https://rickandmortyapi.com/api/location/[${params.ids.join(',')}]`;
  }

  if (params?.id) {
    return `https://rickandmortyapi.com/api/location/${params.id}`;
  }

  return 'https://rickandmortyapi.com/api/location';
}

export { locationUrl };
