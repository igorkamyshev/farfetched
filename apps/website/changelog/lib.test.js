import { describe, test, expect } from 'vitest';

import { groupByVersions, excludeTrashUpdates } from './lib.mjs';

describe('groupByVersion', () => {
  test('correct grouping', () => {
    const changes = [
      {
        name: '@farfetched/core',
        changes: {
          '0.6.4': {
            'Patch Changes': [
              [
                'bulletlist',
                [
                  'listitem',
                  '5da04bf: Fix type inference in ',
                  ['inlinecode', 'createQuery'],
                  ' in ',
                  ['inlinecode', 'effect'],
                  ' and ',
                  ['inlinecode', 'mapData'],
                  ' overload',
                ],
              ],
            ],
          },
          '0.6.3': {},
          '0.6.2': {
            'Patch Changes': [
              [
                'bulletlist',
                [
                  'listitem',
                  '05b4860: Fix ',
                  ['inlinecode', 'cache'],
                  ' invalidation after ',
                  ['inlinecode', 'update'],
                ],
              ],
            ],
          },
          '0.6.1': {
            'Patch Changes': [
              [
                'bulletlist',
                [
                  'listitem',
                  'c2b67a6: Fix ',
                  ['inlinecode', 'cache'],
                  ' overlapping in ',
                  ['inlinecode', 'createJsonQuery'],
                ],
              ],
            ],
          },
        },
      },
      {
        name: '@farfetched/solid',
        changes: {
          '0.6.4': {},
          '0.6.3': {
            'Patch Changes': [
              [
                'bulletlist',
                [
                  'listitem',
                  '0a45391: Re-trigger resource after ',
                  ['inlinecode', 'update'],
                  ' a ',
                  ['em', 'Query'],
                ],
              ],
            ],
          },
          '0.6.2': {},
          '0.6.1': {},
        },
      },
    ];

    const result = groupByVersions(changes);

    expect(result).toEqual([
      {
        version: '0.6.4',
        packages: [
          {
            name: '@farfetched/core',
            changes: {
              'Patch Changes': [
                [
                  'bulletlist',
                  [
                    'listitem',
                    '5da04bf: Fix type inference in ',
                    ['inlinecode', 'createQuery'],
                    ' in ',
                    ['inlinecode', 'effect'],
                    ' and ',
                    ['inlinecode', 'mapData'],
                    ' overload',
                  ],
                ],
              ],
            },
          },
          {
            name: '@farfetched/solid',
            changes: {},
          },
        ],
      },
      {
        version: '0.6.3',
        packages: [
          {
            name: '@farfetched/core',
            changes: {},
          },
          {
            name: '@farfetched/solid',
            changes: {
              'Patch Changes': [
                [
                  'bulletlist',
                  [
                    'listitem',
                    '0a45391: Re-trigger resource after ',
                    ['inlinecode', 'update'],
                    ' a ',
                    ['em', 'Query'],
                  ],
                ],
              ],
            },
          },
        ],
      },
      {
        version: '0.6.2',
        packages: [
          {
            name: '@farfetched/core',
            changes: {
              'Patch Changes': [
                [
                  'bulletlist',
                  [
                    'listitem',
                    '05b4860: Fix ',
                    ['inlinecode', 'cache'],
                    ' invalidation after ',
                    ['inlinecode', 'update'],
                  ],
                ],
              ],
            },
          },
          {
            name: '@farfetched/solid',
            changes: {},
          },
        ],
      },
      {
        version: '0.6.1',
        packages: [
          {
            name: '@farfetched/core',
            changes: {
              'Patch Changes': [
                [
                  'bulletlist',
                  [
                    'listitem',
                    'c2b67a6: Fix ',
                    ['inlinecode', 'cache'],
                    ' overlapping in ',
                    ['inlinecode', 'createJsonQuery'],
                  ],
                ],
              ],
            },
          },
          {
            name: '@farfetched/solid',
            changes: {},
          },
        ],
      },
    ]);
  });
});

describe('excludeTrashUpdates', () => {
  test('delete trash updates from the list', () => {
    const trashUpdates = [
      [
        'bulletlist',
        ['listitem', '896e27d: Update build tool-chain'],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array], [Array]],
      ],
    ];

    expect(excludeTrashUpdates(trashUpdates)).toMatchInlineSnapshot(`
      [
        [
          "bulletlist",
          [
            "listitem",
            "896e27d: Update build tool-chain",
          ],
        ],
      ]
    `);
  });

  test('delete the whole list in case of only updated deps', () => {
    const trashUpdates = [
      [
        'bulletlist',
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array]],
        ['listitem', 'Updated dependencies ', [Array], [Array]],
      ],
    ];

    expect(excludeTrashUpdates(trashUpdates)).toMatchInlineSnapshot(`[]`);
  });
});
