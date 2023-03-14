import { useUnit } from 'effector-react';

import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';

import 'reactflow/dist/style.css';

import { $state } from './graph.view-model';

export function Graph() {
  const initial = useUnit($state);

  const [nodes, _setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, _setEdges, onEgdesChange] = useEdgesState(initial.edges);

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
