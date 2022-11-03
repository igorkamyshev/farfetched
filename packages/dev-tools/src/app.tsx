import { Domain, Scope } from 'effector';
import { useUnit, Provider } from 'effector-solid';
import { render } from 'solid-js/web';

import { OpenButton } from './ui/open_button';
import { Modal } from './ui/modal';
import { open, $open, close } from './ui/model';

function DevToolsApp() {
  const { handleOpen, handleClose, visible } = useUnit({
    handleOpen: open,
    handleClose: close,
    visible: $open,
  });

  return (
    <>
      <OpenButton onClick={handleOpen} />
      <Modal visible={visible()} onClose={handleClose} />
    </>
  );
}

export function initDevTools({
  domain,
  scope,
  container,
}: {
  domain: Domain;
  scope?: Scope;
  container?: HTMLElement;
}) {
  let renderTo = container;
  if (!renderTo) {
    const newContainer = document.createElement('div');
    document.documentElement.appendChild(newContainer);
    renderTo = newContainer;
  }

  if (scope) {
    render(
      () => (
        <Provider value={scope}>
          <DevToolsApp />
        </Provider>
      ),
      renderTo
    );
  } else {
    render(() => <DevToolsApp />, renderTo);
  }
}
