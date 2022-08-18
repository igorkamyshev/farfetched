import { allSettled, fork } from 'effector';

import { $queries, declareQueries, querySearchChanged } from '../model';

describe('entity Query search', () => {
  test('hide all elements', async () => {
    const scope = fork();

    await allSettled(declareQueries, {
      scope,
      params: [{ name: 'wolf' }, { name: 'bear' }],
    });

    expect(scope.getState($queries)).toHaveLength(2);

    await allSettled(querySearchChanged, { scope, params: 'cat' });

    expect(scope.getState($queries)).toHaveLength(0);
  });
});
