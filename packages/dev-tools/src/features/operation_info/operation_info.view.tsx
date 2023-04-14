import { variant } from '@effector/reflect';
import { useUnit } from 'effector-react';
import { Card, Collapse } from 'antd';
import { JsonViewer } from '@textea/json-viewer';

import {
  $stateInfo,
  $activeQuery,
  $operationInfoIsOpen,
  $hasConnections,
  $hasModificators,
} from './operation_info.view-model';
import { CacheInfo } from './views/cache_info.view';
import { ChildrenInfo } from './views/children_info.view';
import { ParentsInfo } from './views/parents_info.view';

import { RetryInfo } from './views/retry_info.view';

function OperationInfoView() {
  const { activeQuery, stateInfo, hasConnections, hasModificators } = useUnit({
    activeQuery: $activeQuery,
    stateInfo: $stateInfo,
    hasConnections: $hasConnections,
    hasModificators: $hasModificators,
  });

  return (
    <Card title={activeQuery?.name}>
      <Collapse>
        {stateInfo.map(([name, value]) => (
          <Collapse.Panel header={`$${name}`} key={name}>
            <JsonViewer
              value={value}
              rootName={false}
              defaultInspectDepth={1}
              collapseStringsAfterLength={7}
            />
          </Collapse.Panel>
        ))}
        {hasConnections && (
          <Collapse.Panel header="connections" key="connections">
            <ChildrenInfo />
            <ParentsInfo />
          </Collapse.Panel>
        )}
        {hasModificators && (
          <Collapse.Panel header="modificators" key="modificators">
            <RetryInfo />
            <CacheInfo />
          </Collapse.Panel>
        )}
      </Collapse>
    </Card>
  );
}

export const OperationInfo = variant({
  if: $operationInfoIsOpen,
  then: OperationInfoView,
});
