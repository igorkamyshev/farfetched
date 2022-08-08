import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { useUnit } from 'effector-solid';
import { For, Show } from 'solid-js';

import { episodeListRoute } from '../../entities/episode';
import { Pagination } from '../../shared/pagination';
import { episodeRoute } from '../episode/model';
import { $currentPage, episodesQuery } from './model';

function EpisodesListPage() {
  const { currentPage } = useUnit({ currentPage: $currentPage });
  const { data, pending } = createQueryResource(episodesQuery);

  return (
    <>
      <h1>Episodes</h1>

      <Show when={!pending()} fallback={'Loading...'}>
        <ol>
          <For each={data()?.results}>
            {(episode) => (
              <li value={episode.id}>
                <Link to={episodeRoute} params={{ episodeId: episode.id }}>
                  {episode.name}
                </Link>
              </li>
            )}
          </For>
        </ol>
        <Pagination
          currentPage={currentPage()}
          totalPages={data()?.info.pages ?? 1}
          hasPrevious={data()?.info.prev !== null}
          hasNext={data()?.info.next !== null}
          route={episodeListRoute}
        />
      </Show>
    </>
  );
}

export { EpisodesListPage };
