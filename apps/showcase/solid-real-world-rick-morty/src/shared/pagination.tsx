import { RouteInstance } from 'atomic-router';
import { Link } from 'atomic-router-solid';
import { For, Show } from 'solid-js';

function Pagination(props: {
  hasPrevious: boolean;
  hasNext: boolean;
  currentPage: number;
  totalPages: number;
  route: RouteInstance<{ page?: number }>;
}) {
  function toParams(page: number) {
    if (page === 1) {
      return {};
    }
    return { page };
  }

  return (
    <>
      <Show when={props.hasPrevious}>
        <Link to={props.route} params={toParams(props.currentPage - 1)}>
          prev
        </Link>
      </Show>
      <For each={allInRange(1, props.totalPages)}>
        {(item) => (
          <>
            <Show when={item !== props.currentPage}>
              <Link
                to={props.route}
                params={toParams(item)}
                activeClass="SOOOO"
              >
                {item}
              </Link>
            </Show>
            <Show when={item === props.currentPage}>{item}</Show>
          </>
        )}
      </For>
      <Show when={props.hasNext}>
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
