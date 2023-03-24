import { scopeBind, type Scope } from 'effector';
import { inspect } from 'effector/inspect';

import { $usedStoreIds } from '../storage';
import { newState } from './states.model';

export function startInspection({
  outerScope,
  innerScope,
}: {
  outerScope?: Scope;
  innerScope: Scope;
}) {
  const reportNewState = scopeBind(newState, { scope: innerScope });

  inspect({
    scope: outerScope,
    fn: (msg) => {
      if (msg.type !== 'update') {
        return;
      }

      const unitIds = innerScope.getState($usedStoreIds);

      if (unitIds.includes(msg.meta['unitId'])) {
        reportNewState({ id: msg.meta['unitId'], value: msg.value });
      }
    },
  });
}
