import { Modal, Row, Col } from 'antd';
import { useUnit } from 'effector-react';

import { Graph } from './features/graph';
import { OperationInfo } from './features/operation_info';
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
      <Row gutter={24}>
        <Col span={12}>
          <Graph />
        </Col>
        <Col span={12}>
          <OperationInfo />
        </Col>
      </Row>
    </Modal>
  );
}
