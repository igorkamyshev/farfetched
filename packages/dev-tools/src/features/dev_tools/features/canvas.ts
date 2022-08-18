import { h } from 'forest';
import { css } from '@emotion/css';

const canvasStyle = css`
  background-color: #f5f5f5;
`;

function Canvas({ fn }: { fn: () => void }) {
  h('section', { classList: [canvasStyle], fn });
}

export { Canvas };
