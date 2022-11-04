import { useUnit } from 'effector-solid';
import { ParentProps, children } from 'solid-js';

import { open, close, $open } from './model';
import { OpenButton } from './open_button';
import { Modal } from './modal';

export function Screen(props: ParentProps) {
  const { handleOpen, handleClose, visible } = useUnit({
    handleOpen: open,
    handleClose: close,
    visible: $open,
  });

  const c = children(() => props.children);

  return (
    <>
      <OpenButton onClick={handleOpen} />
      <Modal visible={visible()} onClose={handleClose}>
        {c()}
      </Modal>
    </>
  );
}
