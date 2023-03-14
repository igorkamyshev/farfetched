import { NodeMetaSumbol } from '@farfetched/core';
import { useMemo } from 'react';
import ReactFlow, { useNodesState, useEdgesState, MarkerType } from 'reactflow';

import 'reactflow/dist/style.css';

import {
  declarations,
  isQueryDeclaration,
  isConnectQueryDeclaration,
} from '../services/storage';

export function Graph() {
  const initialNodes = useMemo(
    () =>
      declarations.filter(isQueryDeclaration).map((declaration, i) => ({
        id: declaration.meta[NodeMetaSumbol].id,
        position: { x: i * 100, y: i * 100 },
        data: { label: declaration.region?.meta.name ?? 'Unknown Query' },
      })),
    []
  );

  const initialEdges = useMemo(
    () =>
      declarations.filter(isConnectQueryDeclaration).map((declaration) => ({
        id: (declaration.region as any).sid!,
        source:
          declaration.meta[NodeMetaSumbol].source[0].meta[NodeMetaSumbol].id,
        target:
          declaration.meta[NodeMetaSumbol].target[0].meta[NodeMetaSumbol].id,
        markerEnd: { type: MarkerType.Arrow },
      })),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEgdesChange] = useEdgesState(initialEdges);

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
