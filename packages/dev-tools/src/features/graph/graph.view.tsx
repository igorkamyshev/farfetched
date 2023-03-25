import { useUnit } from 'effector-react';

import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';

import 'reactflow/dist/style.css';

import { $state } from './graph.view-model';
import { selectDeclaration } from '../operation_info';
import { useEffect } from 'react';

export function Graph() {
  const { initial, handleClick } = useUnit({
    initial: $state,
    handleClick: selectDeclaration,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEgdesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    setNodes(initial.nodes);
  }, [initial.nodes]);

  useEffect(() => {
    setEdges(initial.edges);
  }, [initial.edges]);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      onNodeClick={(event, node) => handleClick(node.id)}
      edges={edges}
      onEdgesChange={onEgdesChange}
      proOptions={{ hideAttribution: true }}
    />
  );
}
