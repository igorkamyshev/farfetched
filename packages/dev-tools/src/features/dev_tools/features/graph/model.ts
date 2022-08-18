import { combine, createEvent, createStore } from 'effector';
import { $activeQueries } from '../../entities/query';
import { GraphNode } from './type';

const $activeNodes = combine($activeQueries, (activeQueries) => [
  ...activeQueries.map((q): GraphNode => ({ ...q, type: 'query' })),
]);

const $openedNode = createStore<GraphNode | null>(null);

const openNode = createEvent<GraphNode>();
const closeNode = createEvent();

$openedNode.on(openNode, (_, node) => node).reset(closeNode);

export { $activeNodes, $openedNode, openNode, closeNode };
