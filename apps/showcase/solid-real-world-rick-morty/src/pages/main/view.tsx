import { createQueryResource } from '@farfetched/solid';
import { Link } from 'atomic-router-solid';
import { useUnit } from 'effector-solid';
import { For, Show } from 'solid-js';

import { characterRoute } from '../character';
import { characterListQuery } from '../../entities/character';
import { Pagination } from '../../shared/pagination';
import { $currentPage, mainRoute } from './model';

function MainPage() {
  const { data, pending } = createQueryResource(characterListQuery);
  const { currentPage } = useUnit({
    currentPage: $currentPage,
  });

  return (
    <>
      <p>MAIN PAGE</p>
      <Show when={pending()}>Loading...</Show>
      <Show when={!pending()}>
        <ol>
          <For each={data()?.results}>
            {(item) => (
              <li value={item.id}>
                <Link to={characterRoute} params={{ characterId: item.id }}>
                  {item.name}
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
          route={mainRoute}
        />
      </Show>
    </>
  );
}

export { MainPage };
