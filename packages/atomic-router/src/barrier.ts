import { type Barrier } from '@farfetched/core';
import { type RouteParamsAndQuery } from 'atomic-router';
import { attach, createEvent, sample, scopeBind } from 'effector';

import { type ChainProtocol } from './chain.ptorocol';

export function barrierChain(barrier: Barrier): ChainProtocol<any> {
  const beforeOpen = createEvent<RouteParamsAndQuery<any>>();

  const openOn = createEvent();

  /** Never called */
  const cancelOn = createEvent();

  const fx = attach({
    source: barrier.__.$mutex,
    async effect(mutex) {
      const boundOpenOn = scopeBind(openOn, { safe: true });

      await mutex?.waitForUnlock();

      boundOpenOn();
    },
  });

  sample({ clock: beforeOpen, target: [barrier.__.touch, fx] });

  return {
    beforeOpen,
    openOn,
    cancelOn,
  };
}
