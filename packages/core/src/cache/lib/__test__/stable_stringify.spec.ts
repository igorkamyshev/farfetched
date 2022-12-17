import { describe, test, expect } from 'vitest';

import { stableStringify } from '../stable_stringify';

function expectWorkAsDefaultJSONSerializer(obj: unknown) {
  const stableStr = stableStringify(obj)!;
  const jsonStr = JSON.stringify(obj);

  expect(JSON.parse(stableStr)).toEqual(JSON.parse(jsonStr));
}

describe('stableStringify', () => {
  test('simple object', () => {
    const obj = { c: 6, b: [4, 5], a: 3, z: null };
    const anotherOrderObj = { b: [4, 5], c: 6, z: null, a: 3 };

    expect(stableStringify(obj)).toEqual('{"a":3,"b":[4,5],"c":6,"z":null}');
    expect(stableStringify(anotherOrderObj)).toEqual(stableStringify(obj));
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('object with undefined', () => {
    const obj = { a: 3, b: undefined };

    expect(stableStringify(obj)).toEqual('{"a":3}');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('object with null', () => {
    const obj = { a: 3, b: null };

    expect(stableStringify(obj)).toEqual('{"a":3,"b":null}');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('object with empty string', () => {
    const obj = { a: 3, z: '' };

    expect(stableStringify(obj)).toEqual('{"a":3,"z":""}');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('object with NaN and Infinity', () => {
    const obj = { a: 3, b: NaN, c: Infinity };

    expect(stableStringify(obj)).toEqual('{"a":3,"b":null,"c":null}');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('array with empty string', () => {
    const obj = [4, '', 6];

    expect(stableStringify(obj)).toEqual('[4,"",6]');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('array with undefined', () => {
    const obj = [4, undefined, 6];

    expect(stableStringify(obj)).toEqual('[4,null,6]');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('array with NaN and Infinity', () => {
    const obj = [4, NaN, Infinity, 6];

    expect(stableStringify(obj)).toEqual('[4,null,null,6]');
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('nested object', () => {
    const obj = { c: 8, b: [{ z: 6, y: 5, x: 4 }, 7], a: 3 };

    expect(stableStringify(obj)).toEqual(
      '{"a":3,"b":[{"x":4,"y":5,"z":6},7],"c":8}'
    );
    expectWorkAsDefaultJSONSerializer(obj);
  });

  test('throws an error for function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => {};

    expect(() => stableStringify(fn)).toThrowError(`Can't serialize function`);
    expect(() => stableStringify({ fn })).toThrowError(
      `Can't serialize function`
    );
  });

  test('throws an error for cycle dependency in object', () => {
    const one: any = { a: 1 };
    const two = { a: 2, one: one };

    one.two = two;

    expect(() => stableStringify(one)).toThrowError(
      `Can't serialize cyclic structure`
    );
  });

  test('throws an error for cycle dependency in array', () => {
    const one: any[] = [1, 2];
    const two = [3, 4, one];

    one.push(two);

    expect(() => stableStringify(one)).toThrowError(
      `Can't serialize cyclic structure`
    );
  });

  test('repeated non-cyclic value for object', () => {
    const one = { x: 1 };
    const two = { a: one, b: one };

    expect(stableStringify(two)).toEqual('{"a":{"x":1},"b":{"x":1}}');
    expectWorkAsDefaultJSONSerializer(two);
  });

  test('repeated non-cyclic value for array', () => {
    const one = [1, 2, 3];
    const two = [one, 2, one];

    expect(stableStringify(two)).toEqual('[[1,2,3],2,[1,2,3]]');
    expectWorkAsDefaultJSONSerializer(two);
  });
});
