import { describe, test, expect } from 'vitest';
import { allSettled, fork } from 'effector';
import { createQuery, retry } from '@farfetched/core';

import { appStarted } from '../../services/viewer';
import { startInspection } from '../../services/tracker';
import { $retryInfo, selectDeclaration } from './operation_info.view-model';

describe('features/operation_info', () => {
  describe('$retryInfo', () => {
    test('provide static value of times', async () => {
      const query = createQuery({ handler: async (_: void) => null });
      retry(query, { times: 3, delay: 0 });

      const userLandScope = fork();
      const devToolsScope = fork();

      const stop = startInspection({ userLandScope, devToolsScope });

      await allSettled(appStarted, { scope: devToolsScope });
      await allSettled(selectDeclaration, {
        scope: devToolsScope,
        params: query.__.meta.node.id,
      });

      expect(devToolsScope.getState($retryInfo)).toEqual([
        expect.objectContaining({
          info: expect.arrayContaining([{ name: 'times', value: 3 }]),
        }),
      ]);

      stop();
    });
  });
});
