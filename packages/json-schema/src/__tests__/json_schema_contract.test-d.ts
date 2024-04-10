import { describe, test, expectTypeOf, expect } from 'vitest';
import { jsonSchemaContract } from '../json_schema_contract';
import { Contract } from '@farfetched/core';

describe('jsonSchemaContract', () => {
  test('works with primitive types', () => {
    const stringContract = jsonSchemaContract({ type: 'string' });
    const numberContract = jsonSchemaContract({ type: 'number' });
    const booleanContract = jsonSchemaContract({ type: 'boolean' });

    expectTypeOf(stringContract).toEqualTypeOf<Contract<unknown, string>>();
    expect(stringContract.isData('string')).toBe(true);
    expect(stringContract.isData(45)).toBe(false);
    expect(stringContract.isData(true)).toBe(false);

    expectTypeOf(numberContract).toEqualTypeOf<Contract<unknown, number>>();
    expect(numberContract.isData('string')).toBe(false);
    expect(numberContract.isData(45)).toBe(true);
    expect(numberContract.isData(true)).toBe(false);

    expectTypeOf(booleanContract).toEqualTypeOf<Contract<unknown, boolean>>();
    expect(booleanContract.isData('string')).toBe(false);
    expect(booleanContract.isData(45)).toBe(false);
    expect(booleanContract.isData(true)).toBe(true);
  });

  test('works with objects', () => {
    const contract = jsonSchemaContract({
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: { age: { type: 'number' }, name: { type: 'string' } },
    });

    expectTypeOf(contract).toEqualTypeOf<
      Contract<unknown, { age?: number; name: string }>
    >();

    expect(contract.isData({ name: 'John', age: 20 })).toBe(true);
    expect(contract.isData({ name: 'John' })).toBe(true);
  });

  test('works with arrays', () => {
    const contract = jsonSchemaContract({
      type: 'array',
      additionalProperties: false,
      items: { type: 'number' },
    });

    expectTypeOf(contract).toEqualTypeOf<Contract<unknown, number[]>>();
    expect(contract.isData([1, 2, 3])).toBe(true);
    expect(contract.isData([1, 2, '3'])).toBe(false);
  });

  test('works with deep and complex objects', () => {
    const contract = jsonSchemaContract({
      type: 'object',
      additionalProperties: false,
      required: ['name', 'hobbies'],
      properties: {
        age: { type: 'number' },
        name: { type: 'string' },
        hobbies: { type: 'array', items: { type: 'string' } },
      },
    });

    expectTypeOf(contract).toEqualTypeOf<
      Contract<unknown, { age?: number; name: string; hobbies: string[] }>
    >();

    expect(contract.isData({ name: 'John', hobbies: ['running'] })).toBe(true);
    expect(contract.isData({ name: 'John' })).toBe(false);
  });

  test('works with string constants', () => {
    const contract = jsonSchemaContract({
      type: 'object',
      additionalProperties: false,
      required: ['type', 'mass'],
      properties: {
        type: { type: 'string', enum: ['asteroid'] },
        mass: { type: 'number' },
      },
    });

    expectTypeOf(contract).toEqualTypeOf<
      Contract<unknown, { type: 'asteroid'; mass: number }>
    >();

    expect(contract.isData({ type: 'asteroid', mass: 9_000 })).toBe(true);
    expect(contract.isData({ type: 'planet', mass: 9_000 })).toBe(false);
  });
});
