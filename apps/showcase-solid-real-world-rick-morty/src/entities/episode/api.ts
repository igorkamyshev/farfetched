import { TId } from '../../shared/id';

function episodeUrl(): string;
function episodeUrl({ id }: { id: TId }): string;
function episodeUrl({ ids }: { ids: TId[] }): string;

function episodeUrl(params?: { id?: TId; ids?: TId[] }) {
  if (params?.ids) {
    return `https://rickandmortyapi.com/api/episode/[${params.ids.join(',')}]`;
  }

  if (params?.id) {
    return `https://rickandmortyapi.com/api/episode/${params.id}`;
  }

  return 'https://rickandmortyapi.com/api/episode';
}

export { episodeUrl };
