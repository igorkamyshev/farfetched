import { describe, test, expect } from 'vitest';

import { isEqual } from '../is_equal';

describe('isEqual', () => {
  // Source: https://github.com/smelukov/nano-equal
  describe('Tests of original implementation', () => {
    const objA = {
      nan: NaN,
      prop1: 'value1',
      prop2: 'value2',
      prop3: 'value3',
      prop4: {
        subProp1: 'sub value1',
        subProp2: {
          subSubProp1: 'sub sub value1',
          subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
        },
      },
      prop5: 1000,
      prop6: new Date(2016, 2, 10),
    };

    const objB = {
      nan: NaN,
      prop5: 1000,
      prop3: 'value3',
      prop1: 'value1',
      prop2: 'value2',
      prop6: new Date('2016/03/10'),
      prop4: {
        subProp2: {
          subSubProp1: 'sub sub value1',
          subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
        },
        subProp1: 'sub value1',
      },
    };

    const objBWithAddProp = {
      prop5: 1000,
      prop3: 'value3',
      prop1: 'value1',
      prop2: 'value2',
      prop6: new Date('2016/03/10'),
      prop4: {
        subProp2: {
          subSubProp1: 'sub sub value1',
          subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
        },
        subProp1: 'sub value1',
      },
      addProp: ';(',
    };

    const recA: any = {};
    const recB: any = {};

    recA.a = recA;
    recB.a = recB;

    const recA2: any = {};
    const recB2: any = {};

    recA2.a = recA2;
    recB2.a = recA2;

    const recA3: any = {};
    const recB3: any = {};

    recA3.a = recB3;
    recB3.a = recA3;

    test('should working correctly', function () {
      expect(isEqual(objA, objA)).toBeTruthy();
      expect(isEqual(objA, objB)).toBeTruthy();
      expect(isEqual(objA, objBWithAddProp)).toBeFalsy();

      expect(isEqual(recA, recB)).toBeFalsy();
      expect(isEqual(recA2, recB2)).toBeTruthy();
      expect(isEqual(recA3, recB3)).toBeFalsy();
    });
  });

  describe('null-proto objects, issue #385', () => {
    test('empty objects', () => {
      const weirdObject1 = Object.create(null);
      const weirdObject2 = Object.create(null);

      expect(() => isEqual(weirdObject1, weirdObject2)).not.toThrow();
      expect(isEqual(weirdObject1, weirdObject2)).toBe(true);
    });

    test('different objects', () => {
      const weirdObject1 = Object.create(null);
      weirdObject1.a = 1;

      const weirdObject2 = Object.create(null);

      expect(() => isEqual(weirdObject1, weirdObject2)).not.toThrow();
      expect(isEqual(weirdObject1, weirdObject2)).toBe(false);
    });

    test('same objects', () => {
      const weirdObject1 = Object.create(null);
      weirdObject1.a = 1;

      const weirdObject2 = Object.create(null);
      weirdObject2.a = 1;

      expect(() => isEqual(weirdObject1, weirdObject2)).not.toThrow();
      expect(isEqual(weirdObject1, weirdObject2)).toBe(true);
    });
  });

  describe('Custom objects', () => {
    class MyValueObject {
      constructor(private value: number) {}
      valueOf() {
        return this.value;
      }
    }

    test('same', () => {
      expect(isEqual(new MyValueObject(1), new MyValueObject(1))).toBe(true);
    });

    test('different', () => {
      expect(isEqual(new MyValueObject(1), new MyValueObject(2))).toBe(false);
    });
  });
});
