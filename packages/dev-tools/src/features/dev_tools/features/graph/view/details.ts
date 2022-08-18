import { h, remap } from 'forest';
import { Store } from 'effector';

import { GraphNode } from '../type';

function Details({ value: $value }: { value: Store<GraphNode> }) {
  h('p', { text: remap($value, 'name') });
}

export { Details };
