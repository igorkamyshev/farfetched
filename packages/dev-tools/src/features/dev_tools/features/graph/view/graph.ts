import { createEvent, sample, Store } from 'effector';
import { h, route, list } from 'forest';
import { css } from '@emotion/css';

import { GraphNode } from '../type';
import { $activeNodes, $openedNode, closeNode, openNode } from '../model';
import { skipPayload } from '../../../../../shared/events';
import { Node } from './node';
import { Details } from './details';

const emptyStateStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const containerStyle = css`
  height: 100%;
`;

function Graph() {
  route({
    source: $activeNodes,
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
    source: $activeNodes,
    visible: (list) => list.length > 0,
    fn({ store: $nodes }) {
      const outsideClicked = closeNode.prepend(skipPayload);

      h('div', {
        classList: [containerStyle],
        handler: { click: outsideClicked },
        fn() {
          h('ul', () => {
            list($nodes, ({ store: $item }) => {
              h('li', () => {
                const handleOpen = createEvent<void>();

                sample({
                  clock: handleOpen,
                  source: $item,
                  target: openNode,
                });

                Node({
                  value: $item,
                  handleOpen,
                });
              });
            });
          });

          route({
            source: $openedNode,
            visible: (node): node is GraphNode => node !== null,
            // TODO: typecast due to forest typings
            fn({ store: $node }: { store: Store<GraphNode> }) {
              Details({ value: $node });
            },
          });
        },
      });
    },
  });
}

export { Graph };
