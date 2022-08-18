import { Store } from 'effector';
import { h, route, list, remap } from 'forest';
import { css } from '@emotion/css';

import { GraphNode } from '../type';

const emptyStateStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

function Graph({ items: $items }: { items: Store<Array<GraphNode>> }) {
  route({
    source: $items,
    visible: (list) => list.length === 0,
    fn() {
      h('div', {
        classList: [emptyStateStyle],
        fn() {
          h('p', { text: '👈 Please select items in the sidebar' });
        },
      });
    },
  });

  route({
    source: $items,
    visible: (list) => list.length > 0,
    fn({ store: $all }) {
      h('ul', () => {
        list($all, ({ store: $item }) => {
          h('li', { text: remap($item, 'name') });
        });
      });
    },
  });
}

export { Graph };
