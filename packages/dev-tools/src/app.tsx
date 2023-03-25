import { Modal, Row, Col, Space } from 'antd';
import { useUnit } from 'effector-react';

import { Graph } from './features/graph';
import { OperationInfo } from './features/operation_info';
import { Search } from './features/search';
import { $visible, hide } from './services/visibility';

export function App() {
  const { open, onClose } = useUnit({ open: $visible, onClose: hide });

  return (
    <Modal
      title="Farfetched DevTools"
      open={open}
      onCancel={onClose}
      footer={null}
      width={'100vw'}
      centered
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Row>
          <Search />
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Graph />
          </Col>
          <Col span={12}>
            <OperationInfo />
          </Col>
        </Row>
      </Space>
    </Modal>
  );
}
