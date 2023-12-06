import { bool, num, str, rec, or, val, arr } from './cntrct';

describe('bool', () => {
  it('valid', () => {
    expect(bool.isData(true)).toBeTruthy();
    expect(bool.getErrorMessages(true)).toEqual([]);

    expect(bool.isData(false)).toBeTruthy();
    expect(bool.getErrorMessages(false)).toEqual([]);
  });

  it('invalid', () => {
    expect(bool.isData(null)).toBeFalsy();
    expect(bool.getErrorMessages(null)).toMatchInlineSnapshot(`
      [
        "expected boolean, got null",
      ]
    `);

    expect(bool.isData(undefined)).toBeFalsy();
    expect(bool.getErrorMessages(undefined)).toMatchInlineSnapshot(
      `
      [
        "expected boolean, got undefined",
      ]
    `
    );

    expect(bool.isData(0)).toBeFalsy();
    expect(bool.getErrorMessages(0)).toMatchInlineSnapshot(`
      [
        "expected boolean, got number",
      ]
    `);

    expect(bool.isData(1)).toBeFalsy();
    expect(bool.getErrorMessages(1)).toMatchInlineSnapshot(`
      [
        "expected boolean, got number",
      ]
    `);

    expect(bool.isData('')).toBeFalsy();
    expect(bool.getErrorMessages('')).toMatchInlineSnapshot(`
      [
        "expected boolean, got string",
      ]
    `);

    expect(bool.isData('a')).toBeFalsy();
    expect(bool.getErrorMessages('a')).toMatchInlineSnapshot(`
      [
        "expected boolean, got string",
      ]
    `);
  });
});

describe('num', () => {
  it('valid', () => {
    expect(num.isData(0)).toBeTruthy();
    expect(num.getErrorMessages(0)).toEqual([]);

    expect(num.isData(1)).toBeTruthy();
    expect(num.getErrorMessages(1)).toEqual([]);

    expect(num.isData(-1)).toBeTruthy();
    expect(num.getErrorMessages(-1)).toEqual([]);
  });

  it('invalid', () => {
    expect(num.isData(null)).toBeFalsy();
    expect(num.getErrorMessages(null)).toMatchInlineSnapshot(`
      [
        "expected number, got null",
      ]
    `);

    expect(num.isData(undefined)).toBeFalsy();
    expect(num.getErrorMessages(undefined)).toMatchInlineSnapshot(
      `
      [
        "expected number, got undefined",
      ]
    `
    );

    expect(num.isData('')).toBeFalsy();
    expect(num.getErrorMessages('')).toMatchInlineSnapshot(`
      [
        "expected number, got string",
      ]
    `);

    expect(num.isData('a')).toBeFalsy();
    expect(num.getErrorMessages('a')).toMatchInlineSnapshot(`
      [
        "expected number, got string",
      ]
    `);

    expect(num.isData(true)).toBeFalsy();
    expect(num.getErrorMessages(true)).toMatchInlineSnapshot(`
      [
        "expected number, got boolean",
      ]
    `);

    expect(num.isData(false)).toBeFalsy();
    expect(num.getErrorMessages(false)).toMatchInlineSnapshot(`
      [
        "expected number, got boolean",
      ]
    `);
  });
});

describe('str', () => {
  it('valid', () => {
    expect(str.isData('')).toBeTruthy();
    expect(str.getErrorMessages('')).toEqual([]);

    expect(str.isData('a')).toBeTruthy();
    expect(str.getErrorMessages('a')).toEqual([]);

    expect(str.isData('abc')).toBeTruthy();
    expect(str.getErrorMessages('abc')).toEqual([]);
  });

  it('invalid', () => {
    expect(str.isData(null)).toBeFalsy();
    expect(str.getErrorMessages(null)).toMatchInlineSnapshot(`
      [
        "expected string, got null",
      ]
    `);

    expect(str.isData(undefined)).toBeFalsy();
    expect(str.getErrorMessages(undefined)).toMatchInlineSnapshot(
      `
      [
        "expected string, got undefined",
      ]
    `
    );

    expect(str.isData(0)).toBeFalsy();
    expect(str.getErrorMessages(0)).toMatchInlineSnapshot(`
      [
        "expected string, got number",
      ]
    `);

    expect(str.isData(1)).toBeFalsy();
    expect(str.getErrorMessages(1)).toMatchInlineSnapshot(`
      [
        "expected string, got number",
      ]
    `);

    expect(str.isData(true)).toBeFalsy();
    expect(str.getErrorMessages(true)).toMatchInlineSnapshot(`
      [
        "expected string, got boolean",
      ]
    `);

    expect(str.isData(false)).toBeFalsy();
    expect(str.getErrorMessages(false)).toMatchInlineSnapshot(`
      [
        "expected string, got boolean",
      ]
    `);
  });

  describe('val', () => {
    const cntrctA = val('a');
    const cntrct1 = val(1);
    const cntrctTrue = val(true);

    it('valid', () => {
      expect(cntrctA.isData('a')).toBeTruthy();
      expect(cntrctA.getErrorMessages('a')).toEqual([]);

      expect(cntrct1.isData(1)).toBeTruthy();
      expect(cntrct1.getErrorMessages(1)).toEqual([]);

      expect(cntrctTrue.isData(true)).toBeTruthy();
      expect(cntrctTrue.getErrorMessages(true)).toEqual([]);
    });

    it('invalid', () => {
      expect(cntrctA.isData('b')).toBeFalsy();
      expect(cntrct1.getErrorMessages('b')).toMatchInlineSnapshot(`
        [
          "expected 1, got \\"b\\"",
        ]
      `);

      expect(cntrct1.isData(2)).toBeFalsy();
      expect(cntrct1.getErrorMessages(2)).toMatchInlineSnapshot(`
        [
          "expected 1, got 2",
        ]
      `);

      expect(cntrctTrue.isData(false)).toBeFalsy();
      expect(cntrctTrue.getErrorMessages(false)).toMatchInlineSnapshot(`
        [
          "expected true, got false",
        ]
      `);
    });
  });

  describe('nullable', () => {
    /* nullable is or(c, val(null)) because it is more explicit */
    const nullableBool = or(bool, val(null));

    it('valid', () => {
      expect(nullableBool.isData(true)).toBeTruthy();
      expect(nullableBool.getErrorMessages(true)).toEqual([]);

      expect(nullableBool.isData(null)).toBeTruthy();
      expect(nullableBool.getErrorMessages(null)).toEqual([]);
    });

    it('invalid', () => {
      expect(nullableBool.isData(undefined)).toBeFalsy();
      expect(nullableBool.getErrorMessages(undefined)).toMatchInlineSnapshot(
        `
        [
          "expected boolean, got undefined",
          "expected null, got undefined",
        ]
      `
      );
    });
  });

  describe('or', () => {
    const cntrct = or(bool, val(0));
    it('valid', () => {
      expect(cntrct.isData(0)).toBeTruthy();
      expect(cntrct.getErrorMessages(0)).toEqual([]);

      expect(cntrct.isData(true)).toBeTruthy();
      expect(cntrct.getErrorMessages(true)).toEqual([]);

      expect(cntrct.isData(false)).toBeTruthy();
      expect(cntrct.getErrorMessages(false)).toEqual([]);
    });

    it('invalid', () => {
      expect(cntrct.isData(1)).toBeFalsy();
      expect(cntrct.getErrorMessages(1)).toMatchInlineSnapshot(`
        [
          "expected boolean, got number",
          "expected 0, got 1",
        ]
      `);

      expect(cntrct.isData('')).toBeFalsy();
      expect(cntrct.getErrorMessages('')).toMatchInlineSnapshot(`
        [
          "expected boolean, got string",
          "expected 0, got \\"\\"",
        ]
      `);
    });
  });

  describe('rec', () => {
    it('empty object', () => {
      const cntrct = rec({});

      expect(cntrct.isData({})).toBeTruthy();
      expect(cntrct.getErrorMessages({})).toEqual([]);

      /* extra keys are allowed */
      expect(cntrct.isData({ a: 1 })).toBeTruthy();
      expect(cntrct.getErrorMessages({ a: 1 })).toEqual([]);
    });

    it('object with bool', () => {
      const cntrct = rec({ enabled: bool });

      expect(cntrct.isData({ enabled: true })).toBeTruthy();
      expect(cntrct.getErrorMessages({ enabled: true })).toEqual([]);

      expect(cntrct.isData({ enabled: false })).toBeTruthy();
      expect(cntrct.getErrorMessages({ enabled: false })).toEqual([]);

      expect(cntrct.isData({})).toBeFalsy();
      expect(cntrct.getErrorMessages({})).toMatchInlineSnapshot(`
        [
          "enabled: expected boolean, got undefined",
        ]
      `);

      expect(cntrct.isData({ enabled: 'true' })).toBeFalsy();
      expect(cntrct.getErrorMessages({ enabled: 'true' }))
        .toMatchInlineSnapshot(`
          [
            "enabled: expected boolean, got string",
          ]
        `);

      expect(cntrct.isData(1)).toBeFalsy();
      expect(cntrct.getErrorMessages(1)).toMatchInlineSnapshot(`
        [
          "expected object, got number",
        ]
      `);
    });

    it('optional field edge case', () => {
      expect(rec({ name: or(str, val(undefined)) }).isData({})).toBeTruthy();
    });
  });

  describe('arr', () => {
    it('valid', () => {
      const cntrctNum = arr(num);

      expect(cntrctNum.isData([])).toBeTruthy();
      expect(cntrctNum.getErrorMessages([])).toEqual([]);

      expect(cntrctNum.isData([1])).toBeTruthy();
      expect(cntrctNum.getErrorMessages([1])).toEqual([]);

      const cntrctBool = arr(bool);

      expect(cntrctBool.isData([])).toBeTruthy();
      expect(cntrctBool.getErrorMessages([])).toEqual([]);

      expect(cntrctBool.isData([true, false])).toBeTruthy();
      expect(cntrctBool.getErrorMessages([true, false])).toEqual([]);
    });

    it('invalid', () => {
      const cntrctNum = arr(num);

      expect(cntrctNum.isData([true])).toBeFalsy();
      expect(cntrctNum.getErrorMessages([true])).toMatchInlineSnapshot(`
        [
          "0: expected number, got boolean",
        ]
      `);

      expect(cntrctNum.isData([1, 'a'])).toBeFalsy();
      expect(cntrctNum.getErrorMessages([1, 'a'])).toMatchInlineSnapshot(`
        [
          "1: expected number, got string",
        ]
      `);

      expect(cntrctNum.isData(true)).toBeFalsy();
      expect(cntrctNum.getErrorMessages(true)).toMatchInlineSnapshot(`
        [
          "expected array, got boolean",
        ]
      `);

      const cntrctBool = arr(bool);

      expect(cntrctBool.isData([1])).toBeFalsy();
      expect(cntrctBool.getErrorMessages([1])).toMatchInlineSnapshot(`
        [
          "0: expected boolean, got number",
        ]
      `);

      expect(cntrctBool.isData([true, 1])).toBeFalsy();
      expect(cntrctBool.getErrorMessages([true, 1])).toMatchInlineSnapshot(
        `
        [
          "1: expected boolean, got number",
        ]
      `
      );
    });
  });
});

describe('complex nested', () => {
  test('format errors for nested objects', () => {
    const cntrct = rec({
      user: rec({ name: str }),
    });

    expect(cntrct.isData({ user: { name: 'a' } })).toBeTruthy();
    expect(cntrct.getErrorMessages({ user: { name: 'a' } })).toEqual([]);

    expect(cntrct.isData({ user: { name: 1 } })).toBeFalsy();
    expect(cntrct.getErrorMessages({ user: { name: 1 } }))
      .toMatchInlineSnapshot(`
        [
          "user: name: expected string, got number",
        ]
      `);
  });

  test('supports objects in arrays', () => {
    const cntrct = arr(rec({ name: str }));

    expect(cntrct.isData([])).toBeTruthy();
    expect(cntrct.getErrorMessages([])).toEqual([]);

    expect(cntrct.isData([{ name: 'a' }])).toBeTruthy();
    expect(cntrct.getErrorMessages([{ name: 'a' }])).toEqual([]);

    expect(cntrct.isData([{ name: 1 }])).toBeFalsy();
    expect(cntrct.getErrorMessages([{ name: 1 }])).toMatchInlineSnapshot(`
      [
        "0: name: expected string, got number",
      ]
    `);
  });
});
