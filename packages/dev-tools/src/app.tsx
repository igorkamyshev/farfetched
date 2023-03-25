import { variant } from '@effector/reflect';
import { Modal, Row, Col, Space, Card } from 'antd';
import { useUnit } from 'effector-react';

import { Graph } from './features/graph';
import { List } from './features/list';
import { OperationInfo } from './features/operation_info';
import { Search } from './features/search';
import { $activeTab, tabChanged, tabList } from './features/view_mode';
import { $visible, hide } from './services/visibility';

export function App() {
  const { open, onClose, activeTab, onTabChange } = useUnit({
    open: $visible,
    onClose: hide,
    activeTab: $activeTab,
    onTabChange: tabChanged,
  });

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
            <Card
              type="inner"
              tabList={tabList}
              activeTabKey={activeTab}
              onTabChange={onTabChange}
              bodyStyle={{ height: '70vh' }}
            >
              <MainContent />
            </Card>
          </Col>
          <Col span={12}>
            <OperationInfo />
          </Col>
        </Row>
      </Space>
    </Modal>
  );
}

const MainContent = variant({
  source: $activeTab,
  cases: { graph: Graph, list: List },
});
