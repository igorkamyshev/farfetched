import { Show } from 'solid-js';
import { css } from '@emotion/css';

import { queryApi } from '../kernel';
import { useItemState } from '../keyval/solid';
import { useUnit } from 'effector-solid';
import { selectQuery } from './model';

export function QueryBlock(props: { id: string }) {
  const query = useItemState(props.id, queryApi);
  const selectCurrentQuery = useUnit(selectQuery);

  return (
    <button
      class={css`
        border: 1px solid black;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `}
      onClick={() => selectCurrentQuery(props.id)}
    >
      <h2>{query().name}</h2>
      <span>
        <Show when={query().pending}>🌊</Show>
        <Show when={!query().enabled}>💤</Show>
      </span>
    </button>
  );
}
