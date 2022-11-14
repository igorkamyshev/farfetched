import { css } from '@emotion/css';
import { useUnit } from 'effector-solid';
import { onMount, Show } from 'solid-js';

import { $allQueryIds } from '../kernel';
import { renderGraph } from './graph';
import { $selectedId, selectQuery } from './model';
import { QueryDetails } from './query_details';

export function Canvas() {
  const { allIds, selectedId, handleSelect } = useUnit({
    allIds: $allQueryIds,
    selectedId: $selectedId,
    handleSelect: selectQuery,
  });

  let graphContainer: HTMLElement;

  onMount(() => {
    renderGraph({
      container: graphContainer,
      allIds: allIds(),
      onClick: handleSelect,
    });
  });

  return (
    <div
      class={css`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        padding: 16px;
      `}
    >
      <div
        ref={(ref) => (graphContainer = ref)}
        class={css`
          min-height: 400px;
          border: 1px solid black;
        `}
      />
      <Show when={selectedId()}>{(id) => <QueryDetails id={id} />}</Show>
    </div>
  );
}
