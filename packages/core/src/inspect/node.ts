import { createNode } from 'effector';

import { NodeMetaSumbol } from './symbol';

export function createMetaNode(meta: Record<string, unknown>) {
  return createNode({ meta: { [NodeMetaSumbol]: meta } });
}
