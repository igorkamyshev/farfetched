import { createDomain } from 'effector';

import { unkownContract } from '../../contract/unkown_contract';
import { identity } from '../../misc/identity';
import { allQueries, onQueryCreated } from '../../domain/query_domain';
import { createHeadlessQuery } from '../create_headless_query';

describe('core/createHeadlessQuery domain', () => {
  test('put Query to domain after creation', () => {
    const testDomain = createDomain('TEST DOMAIN');

    const listener = jest.fn();
    onQueryCreated({ domain: testDomain, fn: listener });

    const testQuery = createHeadlessQuery({
      contract: unkownContract,
      mapData: identity,
      domain: testDomain,
      name: 'some test query',
    });

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(testQuery);
    expect(allQueries({ domain: testDomain })).toEqual([testQuery]);
  });

  test('DO NOT put Query to other domain', () => {
    const correctDomain = createDomain();
    const otherDomain = createDomain();

    const listener = jest.fn();
    onQueryCreated({ domain: otherDomain, fn: listener });

    const testQuery = createHeadlessQuery({
      contract: unkownContract,
      mapData: identity,
      domain: correctDomain,
      name: 'some test query',
    });

    expect(listener).toBeCalledTimes(0);
    expect(allQueries({ domain: otherDomain })).toEqual([]);
  });
});
