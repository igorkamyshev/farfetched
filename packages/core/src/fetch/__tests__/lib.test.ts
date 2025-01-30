import { describe, test, expect } from 'vitest';

import { mergeRecords, splitUrl } from '../lib';

describe('mergeRecords', () => {
  test('empty to empty object', () => {
    expect(mergeRecords({}, {})).toEqual({});
    expect(mergeRecords({})).toEqual({});
    expect(mergeRecords({}, null)).toEqual({});
    expect(mergeRecords({}, undefined)).toEqual({});
    expect(mergeRecords()).toEqual({});
  });

  test('do not alter original with empty object', () => {
    const result = mergeRecords({ 'Content-Type': 'application/json' }, {});

    expect(result).toEqual({ 'Content-Type': 'application/json' });
  });

  test('merge two object object', () => {
    const result = mergeRecords(
      { 'Content-Type': 'application/json' },
      { 'X-Salo': 42 }
    );

    expect(result).toEqual({
      'Content-Type': 'application/json',
      'X-Salo': '42',
    });
  });

  // If someone cast data with `as any` it should not break
  test('ignore invalid external data', () => {
    const result = mergeRecords(
      { 'Content-Type': 'application/json' },
      'd56aa18a-8eb4-43ff-8343-af1f5b2f97bd' as any
    );

    expect(result).toEqual({
      'Content-Type': 'application/json',
    });
  });
});

describe('Safari 14.0 bug', () => {
  test('splitUrl', () => {
    const url = 'https://example.com/api?foo=bar';

    const split = splitUrl(url);

    expect(split).toEqual({
      base: 'https://example.com',
      path: '/api?foo=bar',
    });

    const url1 = new URL(url);
    const url2 = new URL(split.path, split.base);

    expect(url1.href).toBe(url2.href);
  });
});
