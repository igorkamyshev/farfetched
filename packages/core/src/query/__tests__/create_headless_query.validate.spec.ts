import { allSettled, fork } from 'effector';
import { describe, test, expect } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { invalidDataError } from '../../errors/create_error';
import { identity } from '../../misc/identity';
import { createHeadlessQuery } from '../create_headless_query';

describe('core/createHeadlessQuery with validate', () => {
  const defaultConfig = { contract: unknownContract, mapData: identity };
  const defaultHandler = () => 'Random string';

  test('throw error for invalid result (string)', async () => {
    const query = createHeadlessQuery({
      ...defaultConfig,
      validate: () => 'Some validation error',
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(scope.getState(query.$error)).toEqual(
      invalidDataError({ validationErrors: ['Some validation error'] })
    );
  });

  test('throw error for invalid result (array)', async () => {
    const query = createHeadlessQuery({
      ...defaultConfig,
      validate: () => ['first error', 'second error'],
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(scope.getState(query.$error)).toEqual(
      invalidDataError({ validationErrors: ['first error', 'second error'] })
    );
  });

  test('do not throw error for valid result (true)', async () => {
    const query = createHeadlessQuery({
      ...defaultConfig,
      validate: () => true,
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(scope.getState(query.$error)).toBeNull();
  });

  test('do not throw error for valid result (empty array)', async () => {
    const query = createHeadlessQuery({
      ...defaultConfig,
      validate: () => [],
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(scope.getState(query.$error)).toBeNull();
  });

  test('do not throw error for valid result (empty string)', async () => {
    const query = createHeadlessQuery({
      ...defaultConfig,
      validate: () => '',
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(scope.getState(query.$error)).toBeNull();
  });
});
