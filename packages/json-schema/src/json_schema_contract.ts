import { type Contract } from '@farfetched/core';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { betterAjvErrors } from '@apideck/better-ajv-errors';

import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

function jsonSchemaContract<const T extends JSONSchema, R = FromSchema<T>>(
  schema: T
): Contract<unknown, R> {
  const validate = ajv.compile(schema);

  return {
    isData(prepared: unknown): prepared is R {
      return validate(prepared);
    },
    getErrorMessages(prepared: unknown) {
      const valid = validate(prepared);

      if (valid) {
        return [];
      }

      const output = betterAjvErrors({
        schema,
        data: prepared,
        errors: validate.errors!,
      });

      return output.map((v) => `${v.path}: ${v.message}`);
    },
  };
}

export { jsonSchemaContract };
