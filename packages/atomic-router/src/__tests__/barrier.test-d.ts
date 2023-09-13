/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, test } from 'vitest';
import { type Barrier } from '@farfetched/core';
import { chainRoute, createRoute } from 'atomic-router';

import { barrierChain } from '../barrier';

describe('barrierChain', () => {
  test('route with params', () => {
    const authBarrier: Barrier = {} as any;

    const chainedRoute = chainRoute({
      route: createRoute<{ id: number }>(),
      ...barrierChain(authBarrier),
    });
  });

  test('route with no params', () => {
    const authBarrier: Barrier = {} as any;

    const chainedRoute = chainRoute({
      route: createRoute(),
      ...barrierChain(authBarrier),
    });
  });
});
