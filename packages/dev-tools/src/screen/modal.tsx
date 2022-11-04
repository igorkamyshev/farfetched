import { ParentProps, Show, children } from 'solid-js';

export function Modal(
  props: { visible: boolean; onClose: () => void } & ParentProps
) {
  const c = children(() => props.children);

  return <Show when={props.visible}>{c()}</Show>;
}
