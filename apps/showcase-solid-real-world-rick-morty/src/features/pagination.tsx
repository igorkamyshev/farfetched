import { RouteInstance } from 'atomic-router';
import { Link } from 'atomic-router-solid';
import { For, Show } from 'solid-js';

import { TInfo } from '../shared/info';

function Pagination(props: {
  currentPage: number;
  info: TInfo;
  route: RouteInstance<{ page?: number }>;
}) {
  function toParams(page: number) {
    if (page === 1) {
      return {};
    }
    return { page };
  }

  const hasNext = () => props.info.next !== null;
  const hasPrevious = () => props.info.prev !== null;
  const totalPages = () => props.info.pages ?? 1;

  return (
    <>
      <Show when={hasPrevious()}>
        <Link to={props.route} params={toParams(props.currentPage - 1)}>
          prev
        </Link>
      </Show>
      <For each={allInRange(1, totalPages())}>
        {(item) => (
          <>
            <Show when={item !== props.currentPage}>
              <Link to={props.route} params={toParams(item)}>
                {item}
              </Link>
            </Show>
            <Show when={item === props.currentPage}>{item}</Show>
          </>
        )}
      </For>
      <Show when={hasNext()}>
        <Link to={props.route} params={toParams(props.currentPage + 1)}>
          next
        </Link>
      </Show>
    </>
  );
}

function allInRange(from: number, to: number) {
  return Array(to - from + 1)
    .fill(0)
    .map((_, i) => i + from);
}

export { Pagination };
