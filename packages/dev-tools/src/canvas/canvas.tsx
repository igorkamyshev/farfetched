import { css } from '@emotion/css';
import { useUnit } from 'effector-solid';
import { For, Show } from 'solid-js';

import { $allQueryIds } from '../kernel';
import { $selectedId } from './model';
import { QueryBlock } from './query_block';
import { QueryDetails } from './query_details';

export function Canvas() {
  const { queries, selectedId } = useUnit({
    queries: $allQueryIds,
    selectedId: $selectedId,
  });

  return (
    <>
      <section
        class={css`
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px;
        `}
      >
        <For each={queries()}>{(id) => <QueryBlock id={id} />}</For>
      </section>
      <Show when={selectedId()}>{(id) => <QueryDetails id={id} />}</Show>
    </>
  );
}
