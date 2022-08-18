import { h, route, list, remap } from 'forest';

import { $queries } from '../model';

function QueriesList() {
  route({
    source: $queries,
    visible: (list) => list.length === 0,
    fn() {
      h('p', { text: 'Nothing found' });
    },
  });

  route({
    source: $queries,
    visible: (list) => list.length > 0,
    fn({ store: $list }) {
      h('ol', () => {
        list($list, ({ store: $query }) => {
          h('li', { text: remap($query, 'name') });
        });
      });

      h('button', { text: 'Show all' });
      h('button', { text: 'Hide all' });
    },
  });
}

export { QueriesList };
