import { Event } from 'effector';
import { h, spec, handler } from 'forest';
import { css } from '@emotion/css';

import { skipPayload } from '../../shared/events';

const tagStyle = css`
  position: fixed;
  bottom: 10px;
  right: 10px;
`;

function OpenTag({ handleClick }: { handleClick: Event<void> }) {
  h('button', () => {
    spec({ text: 'Farfecthed DevTools' });
    spec({ classList: [tagStyle] });
    handler({ click: handleClick.prepend(skipPayload) });
  });
}

export { OpenTag };
