# Your own GraphQL Query

We are going to release `@farfetched/graphql` in the v0.4 release, until that we suggest you to use `@farfetched/core` and create your own GraphQL [_Query_](/api/primitives/query) factory. In this recipe, we will guide it through this process step-by-step.

## Step 0: choose basement

Basically, GraphQL API is a JSON API with additional restrictions, so we can use [`createJsonQuery`](/api/factories/create_json_query) to simplify the process. Key differences between it and our custom factory are:

1. `createGraphQLQuery` must follow more strict structure of `body`. It has to contain field `query` with the GraphQL query, field `variables` with the variables for the query.
2. `createGraphQLQuery` must not allow user to pass any search-parameters.
3. `createGraphQLQuery` must use only `POST` method.

::: info
Original `createJsonQuery` has plenty of different overloads, but it's a bit noisy to implement all of them in this recipe, so we will use pure JavaScript without TypeScript annotations.
:::

## Step 1: create factory

Let's create the function which we will be used as a factory of our [_Queries_](/api/primitives/query) 👇

```js
function createGraphQLQuery(config) {
  const query = createJsonQuery({
    // ???
  });

  return query;
}
```

:::tip
Do not forget to add path of the factory to a factories list in the [code transformations configuration](/recipes/sids).
:::

Now, we have to write code with mapping from config of `createGraphQLQuery` to config of `createJsonQuery`.

## Step 2: transform config

As we discussed earlier, we have to override only some fields in the `request`, others can be passed as is.

```js{3,5}
function createGraphQLQuery(config) {
  const query = createJsonQuery({
    ...config,
    request: {
      ...config.request,
      method: /* ??? */,
      query: /* ??? */,
      body: /* ??? */,
    },
  });

  return query;
}
```

So, let's start with easy parts: define `request.method` as `POST` in any case and clean `request.query` due to the GraphQL restrictions.

```js{6-7}
function createGraphQLQuery(config) {
  const query = createJsonQuery({
    ...config,
    request: {
      ...config.request,
      method: 'POST',
      query: {},
      body: /* ??? */,
    },
  });

  return query;
}
```

Our next step is `request.body` overriding. Let's assume, that we want to provide interface of our factory the same with `createJsonQuery`, so allow passing only static string as `request.graphQL.query` and function of parameters as `request.graphQL.variables`.

```js
const countriesQuery = createGraphQLQuery({
  request: {
    graphQL: {
      // query is static string
      query: `
        query Countries($language: String!, $fallback: String!) {
          countries {
            iata
            translations(filter: { locales: [$language, $fallback] })
          }
        }`,
      // variables is function  of parameters
      variables: (params) => ({
        language: params.lang,
      }),
    },
  },
});
```

So, let's formulate `request.body` based on these parameters:

```js{8-11}
function createGraphQLQuery(config) {
  const query = createJsonQuery({
    ...config,
    request: {
      ...config.request,
      method: 'POST',
      query: {},
      body: (params) => ({
        query: request.graphQL.query,
        variables: request.graphQL.variables(params))
      }),
    },
  });

  return query;
}
```

## Step 3: enjoy

That is all, we have a ready-to-use factory `createGraphQLQuery`. Returned [_Query_](/api/primitives/query) is a simple [_Query_](/api/primitives/query), it can be used in the same way as any other [_Query_](/api/primitives/query).

```js
// Query is created by built-in factory
const languageQuery = createJsonQuery({
  request: {
    url: '/api/language',
    method: 'GET',
  },
  response: { mapData: ({ result }) => result.language.code },
});

// Query is created by custom factory
const countriesQuery = createGraphQLQuery({
  request: {
    url: '/api/graphql',
    graphQL: {
      query: `
        query Countries($language: String!) {
            countries {
                iata
            translations(filter: { locales: [$language] })
          }
        }`,
      variables: (params) => ({
        language: params.language,
      }),
    },
  },
  response: { mapData: ({ result }) => result.countries },
});

// They can be used together
connectQuery({
  source: languageQuery,
  fn(language) {
    return { params: { language } };
  },
  target: countriesQuery,
});
```

:::info

Of course, there are a lot of improvements to be done like schema introspection, contract generation, etc. We will introduce it in v0.4.

:::
