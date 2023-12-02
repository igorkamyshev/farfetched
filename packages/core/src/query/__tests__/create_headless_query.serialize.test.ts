import { allSettled, fork, serialize } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { unknownContract } from '../../contract/unknown_contract';
import { withFactory } from '../../libs/patronus';
import { createHeadlessQuery } from '../create_headless_query';

describe('core/createHeadlessQuery with serialize', () => {
  const defaultConfig = {
    contract: unknownContract,
    mapData: ({ result }) => result,
  };
  const defaultHandler = () => 'Random string';

  test('ignore all stores in serialization with "ignore" value', async () => {
    const query = withFactory({
      sid: 'test_query',
      fn: () =>
        createHeadlessQuery({
          ...defaultConfig,
          serialize: 'ignore',
        }),
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(query.__.meta.serialize).toBe('ignore');
    expect(serialize(scope)).toEqual({});
  });

  test('apply custom serialization to data', async () => {
    const readMock = vi.fn(() => 'string from read');
    const writeMock = vi.fn(() => 'string for write');

    const query = withFactory({
      sid: 'test_query',
      fn: () =>
        createHeadlessQuery({
          ...defaultConfig,
          serialize: { read: readMock, write: writeMock },
        }),
    });

    const scope = fork({ handlers: [[query.__.executeFx, defaultHandler]] });

    await allSettled(query.start, { scope, params: {} });

    expect(query.__.meta.serialize).toEqual({
      read: readMock,
      write: writeMock,
    });

    const serialized = serialize(scope);

    expect(serialized).toEqual(
      expect.objectContaining({
        'test_query|ff.unnamed.$data': 'string for write',
      })
    );

    const newScope = fork({ values: serialized });

    expect(newScope.getState(query.$data)).toEqual('string from read');
  });
});
