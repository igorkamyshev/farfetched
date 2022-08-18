import { h, remap } from 'forest';
import { createEvent, Event as EEvent, sample, Store } from 'effector';
import { css } from '@emotion/css';

import { GraphNode } from '../type';
import { skipPayload } from '../../../../../shared/events';

const containerStyles = css`
  width: 300px;
  background-color: red;
`;

function Node({
  value: $value,
  handleOpen,
}: {
  value: Store<GraphNode>;
  handleOpen: EEvent<void>;
}) {
  const showButtonClicked = createEvent<Event>();

  sample({ clock: showButtonClicked, target: handleOpen });

  h('div', {
    classList: [containerStyles],
    fn: () => {
      h('p', { text: remap($value, 'name') });

      h('button', {
        text: 'Details',
        handler: {
          on: { click: handleOpen.prepend(skipPayload) },
          config: { stop: true },
        },
      });

      h('button', { text: 'Start' });
    },
  });
}

export { Node };
