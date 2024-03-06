import { allSettled, createWatch, fork } from 'effector';
import { describe, test, expect, vi } from 'vitest';

import { connectQuery } from '../connect_query';
import { createQuery } from '../create_query';

describe('connectQuery filter', () => {
  const languagesQ = createQuery({
    handler: vi.fn(async (p: string) => [p]),
  });

  const blocksQ = createQuery({
    handler: vi.fn(async (p: string) => [p]),
  });

  const contentQ = createQuery({
    handler: vi.fn(async (p: string) => [p]),
  });

  test('filter as function (no args)', async () => {
    const contentStartedFn = vi.fn();

    connectQuery({
      source: { language: languagesQ, blocks: blocksQ },
      filter: () => false,
      fn: ({ language, blocks }) => ({
        params: [...language.result, ...blocks.result].join(','),
      }),
      target: contentQ,
    });

    const scope = fork();

    await allSettled(languagesQ.start, { scope, params: '1' });
    await allSettled(blocksQ.start, { scope, params: '2' });

    expect(contentStartedFn).not.toHaveBeenCalled();
  });

  test('filter as function (args from parents)', async () => {
    const filterFn = vi.fn(() => false);
    const contentStartedFn = vi.fn(() => false);

    connectQuery({
      source: { language: languagesQ, blocks: blocksQ },
      filter: filterFn,
      fn: ({ language, blocks }) => ({
        params: [...language.result, ...blocks.result].join(','),
      }),
      target: contentQ,
    });

    const scope = fork();

    createWatch({ unit: contentQ.started, scope, fn: contentStartedFn });

    await allSettled(languagesQ.start, { scope, params: '1' });
    await allSettled(blocksQ.start, { scope, params: '2' });

    expect(filterFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "blocks": {
              "params": "2",
              "result": [
                "2",
              ],
            },
            "language": {
              "params": "1",
              "result": [
                "1",
              ],
            },
          },
        ],
      ]
    `);
    expect(contentStartedFn).not.toHaveBeenCalled();
  });
});
