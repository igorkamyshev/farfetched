import { useUnit } from 'effector-solid';
import { For } from 'solid-js';

import { allQueries } from './model';

export function Menu() {
  const items = useUnit(allQueries.state.items);

  return (
    <For each={Object.entries(items())}>
      {([key, item]) => <p>{item.name}</p>}
    </For>
  );
}
