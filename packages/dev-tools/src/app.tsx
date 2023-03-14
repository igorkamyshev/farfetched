import { variant } from '@effector/reflect';
import { Graph } from './features/graph';

import { $visible } from './services/visibility';

export const App = variant({ if: $visible, then: DevTools });

function DevTools() {
  return <Graph />;
}
