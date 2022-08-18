import { h } from 'forest';
import { css } from '@emotion/css';

const menuStyle = css`
  min-height: 100vh;
  width: 200px;
  background-color: #fff;
`;

function Menu({ fn }: { fn: () => void }) {
  h('aside', {
    classList: [menuStyle],
    fn: () => {
      h('h2', { text: 'Farfecthed' });

      fn();
    },
  });
}

export { Menu };
