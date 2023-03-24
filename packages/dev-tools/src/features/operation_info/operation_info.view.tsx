import { variant } from '@effector/reflect';
import { useUnit } from 'effector-react';

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
    <section
      style={{
        zIndex: 2,
        backgroundColor: 'white',
        position: 'absolute',
        top: '10px',
        left: '10px',
      }}
    >
      <p>{activeQuery?.name}</p>
      <ChildrenInfo />
      <ParentsInfo />
      <RetryInfo />
      <CacheInfo />
    </section>
  );
}

export const OperationInfo = variant({
  if: $operationInfoIsOpen,
  then: OperationInfoView,
});
