import { useStoreMap } from 'effector-react';
import ReactFlow, { useNodesState, useEdgesState, MarkerType } from 'reactflow';

import 'reactflow/dist/style.css';

import { $queries, $queryConnections } from '../services/storage';

export function Graph() {
  const initialNodes = useStoreMap($queries, (queries) =>
    queries.map((query, i) => ({
      id: query.id,
      position: { x: i * 100, y: i * 100 },
      data: { label: query.name },
      connectable: false,
    }))
  );

  const initialEdges = useStoreMap($queryConnections, (connections) =>
    connections.map((connection) => ({
      id: connection.id,
      source: connection.fromId,
      target: connection.toId,
      markerEnd: { type: MarkerType.Arrow },
    }))
  );

  const [nodes, _1, onNodesChange] = useNodesState(initialNodes);
  const [edges, _2, onEgdesChange] = useEdgesState(initialEdges);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        height: '100vh',
        width: '100vw',
      }}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEgdesChange}
      />
    </div>
  );
}
