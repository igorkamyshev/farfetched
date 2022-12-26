/**
 * Copied from https://github.com/mike182uk/timestring/blob/master/test.js
 */

import { expect, describe, test } from 'vitest';

import { parseTime } from '../time';

describe('timestring', () => {
  test('can parse a timestring', () => {
    expect(parseTime('500ms')).toEqual(0.5 * 1000);
    expect(parseTime('1s')).toEqual(1 * 1000);
    expect(parseTime('1m')).toEqual(60 * 1000);
    expect(parseTime('1h')).toEqual(3600 * 1000);
  });

  describe('can parse different unit identifiers', () => {
    test.each(['ms', 'milli', 'millisecond', 'milliseconds'] as const)(
      '"%s" as milliseconds',
      (unit) => {
        expect(parseTime(`500${unit}`)).toEqual(0.5 * 1000);
      }
    );

    test.each(['s', 'sec', 'secs', 'second', 'seconds'] as const)(
      '"%s" as seconds',
      (unit) => {
        expect(parseTime(`500${unit}`)).toEqual(500 * 1000);
      }
    );

    test.each(['m', 'min', 'mins', 'minute', 'minutes'] as const)(
      '"%s" as minutes',
      (unit) => {
        expect(parseTime(`3${unit}`)).toEqual(3 * 60 * 1000);
      }
    );

    test.each(['h', 'hr', 'hrs', 'hour', 'hours'] as const)(
      '"%s" as hours',
      (unit) => {
        expect(parseTime(`7${unit}`)).toEqual(7 * 60 * 60 * 1000);
      }
    );
  });

  test('can parse a time string containing a decimal value', () => {
    expect(parseTime('1.5hours')).toEqual(parseTime('1h') + parseTime('30m'));
    expect(parseTime('2.75mins')).toEqual(parseTime('2m') + parseTime('45s'));
  });
});
