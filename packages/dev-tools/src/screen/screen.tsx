import { useUnit } from 'effector-solid';
import { ParentProps, children } from 'solid-js';

import { toggle, close, $open } from './model';
import { OpenButton } from './open_button';
import { Modal } from './modal';

export function Screen(props: ParentProps) {
  const { handleButtonClick, handleClose, visible } = useUnit({
    handleButtonClick: toggle,
    handleClose: close,
    visible: $open,
  });

  const c = children(() => props.children);

  return (
    <>
      <OpenButton onClick={handleButtonClick} />
      <Modal visible={visible()} onClose={handleClose}>
        {c()}
      </Modal>
    </>
  );
}
