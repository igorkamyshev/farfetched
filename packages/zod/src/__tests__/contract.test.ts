import { z } from 'zod';

import { zodContract } from '../zod_contract';

describe('zod/zodContract short', () => {
  test('interprets invalid response as error', () => {
    const contract = zodContract(z.string());

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      Array [
        "Expected string, received number",
      ]
    `);
  });

  test('passes valid data', () => {
    const contract = zodContract(z.string());

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });
});
