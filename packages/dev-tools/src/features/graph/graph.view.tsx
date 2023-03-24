import { useUnit } from 'effector-react';
import { Card } from 'antd';

import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';

import 'reactflow/dist/style.css';

import { $state } from './graph.view-model';
import { selectDeclaration } from '../operation_info';

export function Graph() {
  const { initial, handleClick } = useUnit({
    initial: $state,
    handleClick: selectDeclaration,
  });

  const [nodes, _setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, _setEdges, onEgdesChange] = useEdgesState(initial.edges);

  return (
    <Card type="inner" bodyStyle={{ height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        onNodeClick={(event, node) => handleClick(node.id)}
        edges={edges}
        onEdgesChange={onEgdesChange}
        proOptions={{ hideAttribution: true }}
      />
    </Card>
  );
}
