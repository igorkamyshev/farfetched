import { describe, test, expect } from 'vitest';

import { jsonSchemaContract } from '../json_schema_contract';

describe('json-schema/jsonSchemaContract', () => {
  test('interprets invalid response as error', () => {
    const contract = jsonSchemaContract({ type: 'string' });

    expect(contract.getErrorMessages(2)).toMatchInlineSnapshot(`
      [
        "{base}: '' property type must be string",
      ]
    `);
  });

  test('uses readable error for complex data structure', () => {
    const contract = jsonSchemaContract({
      type: 'object',
      properties: { age: { type: 'number' }, name: { type: 'string' } },
    });

    expect(contract.getErrorMessages({ age: 'not a number', name: 11 }))
      .toMatchInlineSnapshot(`
        [
          "{base}.age: 'age' property type must be number",
          "{base}.name: 'name' property type must be string",
        ]
      `);
  });

  test('passes valid data', () => {
    const contract = jsonSchemaContract({ type: 'string' });

    expect(contract.getErrorMessages('foo')).toEqual([]);
  });
});
