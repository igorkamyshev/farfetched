import { type Barrier } from '@farfetched/core';
import { type RouteParamsAndQuery } from 'atomic-router';
import { combine, createEvent, sample, split } from 'effector';

import { type ChainProtocol } from './chain.ptorocol';

export function barrierChain(barrier: Barrier): ChainProtocol<any> {
  const $barrierNotActive = combine(barrier.$active, (active) => !active);

  const beforeOpen = createEvent<RouteParamsAndQuery<any>>();
  const openOn = createEvent<any>();
  const cancelOn = createEvent<any>();

  sample({ clock: beforeOpen, filter: $barrierNotActive, target: openOn });

  const openLater = sample({ clock: beforeOpen, filter: barrier.$active });
  sample({
    clock: [openLater, $barrierNotActive.updates],
    source: openLater,
    filter: $barrierNotActive,
    target: openOn,
  });

  openLater.watch(() => console.log('openLater'));

  return {
    beforeOpen,
    openOn,
    cancelOn,
  };
}
