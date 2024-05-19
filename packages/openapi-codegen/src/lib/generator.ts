import Oas from 'oas';

import { compile } from 'handlebars';

const apiGenerator = compile(`
import { createJsonQuery, createQuery, declareParams } from '@farfetched/core';
import { jsonSchemaContract } from "@farfetched/json-schema";

{{#each queries}}
{{{this}}}
{{/each}}
`);

const queryGenerator = compile(`
export const {{name}}Query = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: '{{method}}',
    url: () => '{{{url}}}',
  },
  response: {
   {{{contract}}}
  },
});
`);

const contractGenerator = compile(
  ` contract: jsonSchemaContract( {{{jsonSchema}}} ),`
);

function getAllOasOperations(oas: Oas) {
  return Object.values(oas.getPaths()).flatMap((v) => Object.values(v));
}

export function generateQueries(oas: Oas) {
  if (!oas.api.paths) {
    return;
  }

  const queries: string[] = [];

  const operations = getAllOasOperations(oas);

  for (const operation of operations) {
    const { method, path } = operation;

    if (!operation.isJson()) {
      console.warn(`Skipping ${method} ${path} because it is not JSON.`);

      continue;
    }

    const params = operation.getParametersAsJSONSchema();

    const response = operation.getResponseAsJSONSchema(200) ?? [];

    const responseBody = response.find((v) => v.label === 'Response body');

    if (responseBody) {
      deepOmit(responseBody, 'x-readme-ref-name');
    }

    const ffQuery = queryGenerator({
      name: operation.getOperationId(),
      url: path,
      method: method.toUpperCase(),
      contract: responseBody
        ? contractGenerator({ jsonSchema: JSON.stringify(responseBody.schema) })
        : '',
    });

    queries.push(ffQuery);
  }

  return apiGenerator({ queries });
}

function deepOmit(obj: Object, key: string) {
  // @ts-expect-error
  delete obj[key];

  for (const val of Object.values(obj)) {
    if (typeof val === 'object') {
      deepOmit(val, key);
    }
  }
}
