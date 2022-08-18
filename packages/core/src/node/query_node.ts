import { createNode, Node } from 'effector';

type QueryNode = Node;

function createQueryNode(): QueryNode {
  return createNode({ meta: { type: 'Farfetched Query' } });
}

export { createQueryNode };
