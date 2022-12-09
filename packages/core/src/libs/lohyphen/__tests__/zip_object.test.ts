import { describe, test, expect } from 'vitest';

import { zipObject } from '../zip_object';

describe('zipObject', () => {
  test('empty objects', () => {
    expect(zipObject({})).toEqual({});
  });

  test('params and results', () => {
    expect(
      zipObject({
        params: { language: 'req', index: 'in' },
        result: { language: 'ru', index: 1 },
      })
    ).toEqual({
      language: { params: 'req', result: 'ru' },
      index: { params: 'in', result: 1 },
    });
  });

  test('doubdle call', () => {
    const input = {
      params: { language: 'req', index: 'in' },
      result: { language: 'ru', index: 1 },
    };

    expect(zipObject(zipObject(input))).toEqual(input);
  });
});
