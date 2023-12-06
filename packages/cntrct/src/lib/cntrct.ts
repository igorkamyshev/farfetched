import { type Contract } from '@farfetched/core';

export const bool: Contract<unknown, boolean> = createSimpleContract(
  (x: unknown): x is boolean => {
    return typeof x === 'boolean';
  },
  'boolean'
);

export const num: Contract<unknown, number> = createSimpleContract(
  (x: unknown): x is number => {
    return typeof x === 'number';
  },
  'number'
);

export const str: Contract<unknown, string> = createSimpleContract(
  (x: unknown): x is string => {
    return typeof x === 'string';
  },
  'string'
);

export function val<T extends string | number | boolean | null | undefined>(
  value: T
): Contract<unknown, T> {
  const check = (x: unknown): x is T => {
    return x === value;
  };

  return {
    isData: check,
    getErrorMessages: (actual) => {
      if (check(actual)) {
        return [];
      }

      return [
        `expected ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`,
      ];
    },
  };
}

export function or<T extends Array<Contract<unknown, any>>>(
  ...contracts: T
): Contract<unknown, ContarctValue<T[number]>> {
  const check = (x: unknown): x is ContarctValue<T[number]> =>
    contracts.some((c) => c.isData(x));

  return {
    isData: check,
    getErrorMessages(x: unknown): string[] {
      if (check(x)) {
        return [];
      }

      return contracts.flatMap((c) => c.getErrorMessages(x));
    },
  };
}

export function rec<C extends Record<string, Contract<unknown, any>>>(
  c: C
): Contract<unknown, { [key in keyof C]: ContarctValue<C[key]> }> {
  const check = (
    x: unknown
  ): x is { [key in keyof C]: ContarctValue<C[key]> } => {
    if (typeof x !== 'object' || x === null) return false;

    let valid = true;
    for (const [key, val] of Object.entries(c)) {
      if (!val.isData((x as any)[key])) {
        valid = false;
        break;
      }
    }

    return valid;
  };

  return {
    isData: check,
    getErrorMessages(x: unknown): string[] {
      if (check(x)) {
        return [];
      }

      if (typeof x !== 'object' || x === null) {
        return [`expected object, got ${typeOf(x)}`];
      }
      const errors = [] as string[];

      for (const [key, val] of Object.entries(c)) {
        const newErrors = val.getErrorMessages((x as any)[key]);
        errors.push(...newErrors.map((msg) => `${key}: ${msg}`));
      }

      return errors;
    },
  };
}

export function arr<V>(c: Contract<unknown, V>): Contract<unknown, V[]> {
  const check = (x: unknown): x is V[] =>
    Array.isArray(x) && x.every((v) => c.isData(v));

  return {
    isData: check,
    getErrorMessages(x: unknown): string[] {
      if (check(x)) {
        return [];
      }

      if (!Array.isArray(x)) {
        return [`expected array, got ${typeOf(x)}`];
      }

      return x.flatMap((v, idx) =>
        c.getErrorMessages(v).map((message) => `${idx}: ${message}`)
      );
    },
  };
}

// -- types

export type ContarctValue<C extends Contract<unknown, any>> =
  C extends Contract<unknown, infer T> ? T : never;

// -- utils

function createSimpleContract<T>(
  check: (x: unknown) => x is T,
  exepctedType: string
): Contract<unknown, T> {
  return {
    isData: check,
    getErrorMessages(actual: unknown) {
      if (check(actual)) {
        return [];
      }

      return [`expected ${exepctedType}, got ${typeOf(actual)}`];
    },
  };
}

function typeOf(x: unknown): string {
  return x === null ? 'null' : typeof x;
}
