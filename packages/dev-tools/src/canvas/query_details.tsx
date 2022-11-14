import { Show } from 'solid-js';
import { css } from '@emotion/css';

import { queryApi } from '../kernel';
import { useItemApi, useItemState } from '../keyval/solid';

export function QueryDetails(props: { id: string }) {
  const query = useItemState(props.id, queryApi);
  const { forceStart } = useItemApi(props.id, queryApi);

  return (
    <Show when={query()}>
      {({ name }) => (
        <section
          class={css`
            border: 1px solid black;
            display: flex;
            flex-direction: column;
            gap: 8px;
          `}
        >
          <h2>{name}</h2>
          <QueryState id={props.id} />
          <ParamsEditor id={props.id} />
          <button onClick={forceStart}>Force start</button>
        </section>
      )}
    </Show>
  );
}

function ParamsEditor(props: { id: string }) {
  const query = useItemState(props.id, queryApi);
  const { paramsChanged } = useItemApi(props.id, queryApi);

  return (
    <label>
      Params
      <input
        value={JSON.stringify(query().currentParams)}
        onInput={(e) => {
          try {
            const value = JSON.parse(e.currentTarget.value);
            paramsChanged(value);
          } catch {
            // ignore
          }
        }}
      />
    </label>
  );
}

function QueryState(props: { id: string }) {
  const query = useItemState(props.id, queryApi);

  return (
    <span>
      <Show when={query().pending}>🌊</Show>
      <Show when={!query().enabled}>💤</Show>
    </span>
  );
}
