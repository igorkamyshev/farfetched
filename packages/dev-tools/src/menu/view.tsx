import { useUnit } from 'effector-solid';
import { For } from 'solid-js';

import { $menuItems } from './model';

export function Menu() {
  const items = useUnit($menuItems);

  return (
    <ul>
      <For each={items()}>
        {([id, item]) => (
          <li>
            <MenuItem name={item.name} id={id} />
          </li>
        )}
      </For>
    </ul>
  );
}

function MenuItem(props: { id: string; name: string }) {
  return <span>{props.name}</span>;
}
