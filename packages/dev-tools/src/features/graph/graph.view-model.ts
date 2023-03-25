import { type Node, type Edge, Position, MarkerType } from 'reactflow';
import { graphlib, layout } from 'dagre';
import { combine } from 'effector';

import { $queryConnections } from '../../services/storage';
import { $foundQueries } from '../../services/filters';

const dagreGraph = new graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

function getLayoutedElements({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
}

export const $state = combine(
  { queries: $foundQueries, queryConnections: $queryConnections },
  ({ queries, queryConnections }) =>
    getLayoutedElements({
      nodes: queries.map((query) => ({
        id: query.id,
        position: { x: 0, y: 0 },
        data: { label: query.name },
        connectable: false,
      })),
      edges: queryConnections.map((connection) => ({
        id: connection.id,
        source: connection.fromId,
        target: connection.toId,
        markerEnd: { type: MarkerType.Arrow },
        label: 'cause',
      })),
    })
);
