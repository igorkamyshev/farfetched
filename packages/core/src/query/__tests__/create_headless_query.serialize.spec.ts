import { allSettled, fork, serialize } from 'effector';
import { unkownContract } from '../../contract/unkown_contract';
import { identity } from '../../misc/identity';
import { withFactory } from '../../misc/sid';
import { createHeadlessQuery } from '../create_headless_query';

describe('core/createHeadlessQuery with serialize', () => {
  const defaultConfig = { contract: unkownContract, mapData: identity };
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
    expect(serialize(scope, { onlyChanges: true })).toEqual({});
  });
});
