# Validators

:::tip You will learn

- What [_Validator_](/api/primitives/validator) is
- When to use [_Validator_](/api/primitives/validator)
- Difference between [_Contracts_](/api/primitives/contract) and [_Validator_](/api/primitives/validator)

:::

Sometimes, it is important to validate data after request based on input parameters. For example, you can have a query that takes ID and returns an object with this, but you want to validate that object has the same ID as you requested. In this case, you can use [_Validator_](/api/primitives/validator).

```ts
const blockQuery = createQuery({
  effect: createEffect(async ({ id }) => {
    const response = await fetch(`https://api.salo.com/blocks/${id}.json`);

    return response.json();
  }),
  validate: ({ result }, { id }) => result.id === id,
});
```

## Validators vs Contracts

::: tip TL;DR
[_Contract_](/api/primitives/contract) for structure, [_Validator_](/api/primitives/validator) for content
:::

[_Validator_](/api/primitives/validator) is a dynamic check that does not have any effect on the result of the query, it is only used to check if data is valid. While, [_Contract_](/api/primitives/contract) is a static check that ensures the exact structure of the data, it casts `unknown` result to a specific type.
