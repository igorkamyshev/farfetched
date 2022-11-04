import { css } from '@emotion/css';
import { splitProps } from 'solid-js';

import logo from '../../../../branding/Farfetched.png';

export function OpenButton(props: {
  onClick: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const [{ position = 'bottom-right', onClick }] = splitProps(props, [
    'position',
    'onClick',
  ]);

  return (
    <button
      onClick={onClick}
      class={css`
        position: fixed;
        display: flex;
        width: 48px;
        height: 48px;
      `}
      classList={{
        [topRight]: position === 'top-right',
        [topLeft]: position === 'top-left',
        [bottomLeft]: position === 'bottom-left',
        [bottomRight]: position === 'bottom-right',
      }}
    >
      <img src={logo} />
    </button>
  );
}

const SPACE = '16px';

const bottomRight = css`
  right: ${SPACE};
  bottom: ${SPACE};
`;

const bottomLeft = css`
  left: ${SPACE};
  bottom: ${SPACE};
`;

const topLeft = css`
  left: ${SPACE};
  top: ${SPACE};
`;

const topRight = css`
  right: ${SPACE};
  top: ${SPACE};
`;
