import { createJsonQuery, createQuery, declareParams } from "@farfetched/core";
import { jsonSchemaContract } from "@farfetched/json-schema";

export const listPetsQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: "GET",
    url: () => "/pets",
  },
  response: {
    contract: jsonSchemaContract({
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: {
            type: "integer",
            format: "int64",
            minimum: -9223372036854776000,
            maximum: 9223372036854776000,
          },
          name: { type: "string" },
          tag: { type: "string" },
        },
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    }),
  },
});

export const createPetsQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: "POST",
    url: () => "/pets",
  },
  response: {},
});

export const showPetByIdQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: "GET",
    url: () => "/pets/{petId}",
  },
  response: {
    contract: jsonSchemaContract({
      type: "object",
      required: ["id", "name"],
      properties: {
        id: {
          type: "integer",
          format: "int64",
          minimum: -9223372036854776000,
          maximum: 9223372036854776000,
        },
        name: { type: "string" },
        tag: { type: "string" },
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    }),
  },
});
