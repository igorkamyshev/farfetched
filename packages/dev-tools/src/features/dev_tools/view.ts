import { Event } from 'effector';
import { h, spec } from 'forest';
import { css } from '@emotion/css';

import { Menu } from './features/menu';
import { Modal } from './features/modal';
import { Canvas } from './features/canvas';
import { QueriesList, QuerySearch } from './entities/query';
import { Graph } from './features/graph';

const containerStyle = css`
  display: flex;
`;

const canvasStyle = css`
  flex-grow: 1;
`;

function DevTools({ handleCloseClick }: { handleCloseClick: Event<void> }) {
  Modal({
    handleClose: handleCloseClick,
    fn() {
      spec({ classList: [containerStyle] });

      Menu({
        fn() {
          h('h3', { text: 'Queries' });

          QuerySearch();
          QueriesList();
        },
      });

      Canvas({
        fn() {
          spec({ classList: [canvasStyle] });

          Graph();
        },
      });
    },
  });
}

export { DevTools };
