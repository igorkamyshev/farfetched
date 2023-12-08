import { createNode } from 'effector';

export const NodeMetaSumbol = Symbol('Farfetched node meta');

export function createMetaNode(meta: Record<string, unknown>) {
  return createNode({
    meta: { [NodeMetaSumbol]: meta },
    regional: true,
  });
}
