import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { useUnit } from 'effector-solid';
import { For, Show, Suspense } from 'solid-js';

import { episodeListRoute, episodeRoute } from '../../entities/episode';
import { Pagination } from '../../features/pagination';
import { $currentPage, episodesQuery } from './model';

function EpisodesListPage() {
  const { currentPage } = useUnit({ currentPage: $currentPage });
  const [data] = createQueryResource(episodesQuery);

  return (
    <>
      <h1>Episodes</h1>

      <Suspense fallback={'Loading...'}>
        <Show when={data()}>
          {({ info, results }) => (
            <>
              <ol>
                <For each={results}>
                  {(episode) => (
                    <li value={episode.id}>
                      <Link
                        to={episodeRoute}
                        params={{ episodeId: episode.id }}
                      >
                        {episode.name}
                      </Link>
                    </li>
                  )}
                </For>
              </ol>
              <Pagination
                currentPage={currentPage()}
                info={info}
                route={episodeListRoute}
              />
            </>
          )}
        </Show>
      </Suspense>
    </>
  );
}

export { EpisodesListPage };
