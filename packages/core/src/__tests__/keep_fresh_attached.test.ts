import { describe, test, expect, vi } from 'vitest';

import { createJsonQuery } from '../query/create_json_query';
import { keepFresh } from '../trigger_api/keep_fresh';
import { attachOperation } from '../attach/attach';
import { allSettled, createStore, createWatch, fork } from 'effector';
import { unknownContract } from '../contract/unknown_contract';

describe('combination of keepFresh and attachOperation', () => {
  test('re-execute attached when changes source in original', async () => {
    const handler = vi.fn().mockResolvedValue('ok');

    const $url = createStore('https://api.salo.com/');

    const originalQuery = createJsonQuery({
      request: { url: $url, method: 'GET' },
      response: { contract: unknownContract },
    });

    const attachedQuery = attachOperation(originalQuery);

    keepFresh(attachedQuery, { automatically: true });

    const scope = fork({ handlers: [[originalQuery.__.executeFx, handler]] });

    const attachedFinallyListener = vi.fn();

    createWatch({
      unit: attachedQuery.finished.finally,
      fn: attachedFinallyListener,
      scope,
    });

    await allSettled(attachedQuery.refresh, { scope });

    expect(attachedFinallyListener).toBeCalledTimes(1);

    await allSettled($url, { scope, params: 'https://api.salo.com/v2/' });

    expect(attachedFinallyListener).toBeCalledTimes(2);
  });
});
