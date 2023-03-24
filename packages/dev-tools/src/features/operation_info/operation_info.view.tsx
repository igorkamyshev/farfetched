import { variant } from '@effector/reflect';
import { useUnit } from 'effector-react';
import { Card, Collapse } from 'antd';

import {
  $activeQuery,
  $operationInfoIsOpen,
} from './operation_info.view-model';
import { CacheInfo } from './views/cache_info.view';
import { ChildrenInfo } from './views/children_info.view';
import { ParentsInfo } from './views/parents_info.view';

import { RetryInfo } from './views/retry_info.view';

function OperationInfoView() {
  const { activeQuery } = useUnit({
    activeQuery: $activeQuery,
  });

  return (
    <Card title={activeQuery?.name}>
      <Collapse>
        <Collapse.Panel header="Connections" key="connections">
          <ChildrenInfo />
          <ParentsInfo />
        </Collapse.Panel>
        <Collapse.Panel header="Modificators" key="modificators">
          <RetryInfo />
          <CacheInfo />
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
}

export const OperationInfo = variant({
  if: $operationInfoIsOpen,
  then: OperationInfoView,
});
