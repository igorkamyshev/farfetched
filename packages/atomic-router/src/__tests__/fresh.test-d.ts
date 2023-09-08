/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, test } from 'vitest';
import { type Query } from '@farfetched/core';
import { chainRoute, createRoute, RouteParamsAndQuery } from 'atomic-router';

import { freshChain } from '../fresh';

describe('freshChain', () => {
  test('infer params type from route, no mapping', () => {
    const correctQuery: Query<{ id: number }, number, string> = {} as any;

    const chainedRoute = chainRoute({
      route: createRoute<{ id: number }>(),
      ...freshChain(correctQuery),
    });

    const incorrectQuery: Query<{ id: string }, number, string> = {} as any;

    // @ts-expect-error incorrect params type
    const incorrectChainedRoute = chainRoute({
      route: createRoute<{ id: number }>(),
      ...freshChain(incorrectQuery),
    });
  });

  test('infer params type from route, void query', () => {
    const someRoute = createRoute<{ id: number }>();

    const correctQuery: Query<void, number, string> = {} as any;

    const chainedRoute = chainRoute({
      route: someRoute,
      ...freshChain(correctQuery),
    });
  });
});
