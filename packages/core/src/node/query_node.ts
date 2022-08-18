import { createNode, Node } from 'effector';

type QueryNode = Node;

function createQueryNode({ name }: { name: string }): QueryNode {
  return createNode({
    meta: { type: 'Farfetched Query', name },
  });
}

export { createQueryNode };
