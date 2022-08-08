import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { useUnit } from 'effector-solid';
import { For, Show } from 'solid-js';

import { characterRoute, characterListRoute } from '../../entities/character';
import { Pagination } from '../../shared/pagination';
import { $currentPage, characterListQuery } from './model';

function MainPage() {
  const { data, pending } = createQueryResource(characterListQuery);
  const { currentPage } = useUnit({
    currentPage: $currentPage,
  });

  return (
    <>
      <h1>Main page</h1>
      <Show when={!pending()} fallback={'Loading...'}>
        <ol>
          <For each={data()?.results}>
            {(character) => (
              <li value={character.id}>
                <Link
                  to={characterRoute}
                  params={{ characterId: character.id }}
                >
                  {character.name}
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
          route={characterListRoute}
        />
      </Show>
    </>
  );
}

export { MainPage };
