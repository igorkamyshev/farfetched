import { h } from 'forest';
import { css } from '@emotion/css';
import { Event } from 'effector';

import { skipPayload } from '../../../shared/events';

const containerStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
`;

const closeButtonStyle = css`
  position: fixed;
  right: 10px;
  top: 10px;
`;

function Modal({
  handleClose,
  fn,
}: {
  handleClose: Event<void>;
  fn: () => void;
}) {
  h('section', {
    classList: [containerStyle],
    fn: () => {
      h('button', {
        text: 'Close',
        classList: [closeButtonStyle],
        handler: { click: handleClose.prepend(skipPayload) },
      });

      fn();
    },
  });
}

export { Modal };
