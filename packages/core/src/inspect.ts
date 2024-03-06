import { createNode } from 'effector';

export const NodeMetaSumbol = Symbol('Farfetched node meta');
export const NodeLinksSumbol = Symbol('Farfetched links meta');

export function createMetaNode(
  meta: Record<string, unknown>,
  links: Record<string, unknown>
) {
  return createNode({
    meta: { [NodeMetaSumbol]: meta, [NodeLinksSumbol]: links },
    regional: true,
  });
}
