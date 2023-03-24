import { scopeBind, type Scope } from 'effector';
import { inspect } from 'effector/inspect';

import { $usedStoreIds } from '../storage';
import { newState } from './states.model';

export function startInspection({
  userLandScope,
  devToolsScope,
}: {
  userLandScope?: Scope;
  devToolsScope: Scope;
}) {
  const reportNewState = scopeBind(newState, { scope: devToolsScope });

  return inspect({
    scope: userLandScope,
    fn: ({ type, meta, value }) => {
      if (type !== 'update') {
        return;
      }

      const unitIds = devToolsScope.getState($usedStoreIds);

      if (unitIds.includes(meta['unitId'] as string)) {
        reportNewState({ id: meta['unitId'] as string, value });
      }
    },
  });
}
