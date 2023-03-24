import { variant } from '@effector/reflect';

import { Graph } from './features/graph';
import { OperationInfo } from './features/operation_info';
import { $visible } from './services/visibility';

export const App = variant({ if: $visible, then: DevTools });

function DevTools() {
  return (
    <>
      <Graph />
      <OperationInfo />
    </>
  );
}
