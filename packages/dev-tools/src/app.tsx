import { variant } from '@effector/reflect';

import { $visible } from './services/visibility';

export const App = variant({ if: $visible, then: DevTools });

function DevTools() {
  return <p>...</p>;
}
