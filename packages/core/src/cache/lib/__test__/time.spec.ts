import { parseTime } from '../time';

describe('parseTime', () => {
  test('parse number', () => {
    expect(parseTime(10)).toBe(10);
    expect(parseTime(442)).toBe(442);
    expect(parseTime(1222)).toBe(1222);
  });

  test('parse seconds', () => {
    expect(parseTime('1sec')).toBe(1_000);
    expect(parseTime('2sec')).toBe(2_000);
    expect(parseTime('10sec')).toBe(10_000);
  });

  test('parse minutes', () => {
    expect(parseTime('1min')).toBe(60_000);
    expect(parseTime('2min')).toBe(120_000);
    expect(parseTime('10min')).toBe(600_000);
    expect(parseTime('14min')).toBe(840_000);
  });

  test('parse hours', () => {
    expect(parseTime('1h')).toBe(3_600_000);
    expect(parseTime('2h')).toBe(7_200_000);
    expect(parseTime('10h')).toBe(36_000_000);
    expect(parseTime('15h')).toBe(54_000_000);
  });

  test('parse minutes and seconds', () => {
    expect(parseTime('1min 1sec')).toBe(61_000);
    expect(parseTime('2min 2sec')).toBe(122_000);
    expect(parseTime('10min 10sec')).toBe(610_000);
    expect(parseTime('14min 56sec')).toBe(896_000);
  });

  test('parse hours and minutes', () => {
    expect(parseTime('1h 1min')).toBe(3_660_000);
    expect(parseTime('2h 2min')).toBe(7_320_000);
    expect(parseTime('10h 10min')).toBe(36_600_000);
    expect(parseTime('15h 34min')).toBe(56_040_000);
  });

  test('parse hours, minutes and seconds', () => {
    expect(parseTime('1h 1min 1sec')).toBe(3_661_000);
    expect(parseTime('2h 2min 2sec')).toBe(7_322_000);
    expect(parseTime('10h 10min 10sec')).toBe(36_610_000);
    expect(parseTime('12h 34min 56sec')).toBe(45_296_000);
  });
});
