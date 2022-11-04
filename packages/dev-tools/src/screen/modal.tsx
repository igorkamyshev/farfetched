import { ParentProps, Show, children } from 'solid-js';
import { css } from '@emotion/css';

export function Modal(
  props: { visible: boolean; onClose: () => void } & ParentProps
) {
  const c = children(() => props.children);

  return (
    <Show when={props.visible}>
      <div
        class={css`
          position: fixed;
          top: 0px;
          left: 0px;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          class={css`
            position: absolute;
            z-index: -1;
            background: gray;
            width: 100%;
            height: 100%;
            filter: blur(5px);
          `}
          onClick={props.onClose}
        />
        <div
          class={css`
            background: white;
            border-radius: 8px;
            width: calc(100% - 64px);
            height: calc(100% - 64px);
            overflow: scroll;
          `}
        >
          {c()}
        </div>
      </div>
    </Show>
  );
}
