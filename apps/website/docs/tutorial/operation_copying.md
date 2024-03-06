# Operation copying

::: danger

This topic is considered obsolete since [v0.12](/releases/0-12) and will be removed in v0.14. Please read [this ADR](/adr/attach_operation_deprecation) for more information and migration guide.
:::

> It is advanced topic, so you can write an application without it. But it is useful when you have a lot of similar _Queries_ and _Mutations_ and want to simplify your code.

:::tip You will learn:

- When you need to copy _Queries_ and _Mutations_
- How to copy _Queries_ and _Mutations_
- How to simplify your code with _Queries_ and _Mutations_ copying

:::

## Use-case for copying _Queries_ and _Mutations_

Let's revise the example from the [previous chapters](/tutorial/dependent_queries). We have two [_Queries_](/api/primitives/query): `characterQuery` and `originQuery`. Let's imagine, we want to add a new _Query_ `currentLocationQuery` that will be similar to `originQuery`, but will fetch the current location of the character.

```ts{9-15}
const characterQuery = createQuery(/* ... */);

const originQuery = createQuery({
  handler: async ({ originUrl }) => {
    const response = await fetch(originUrl);
    return response.json();
  },
});

const currentLocationQuery = createQuery({
  handler: async ({ currentLocationUrl }) => {
    const response = await fetch(currentLocationUrl);
    return response.json();
  },
});
```

As you can see, the only difference between `originQuery` and `currentLocationQuery` is parameters, so it would be nice to have a way to copy the _Query_ and change only the parameters.

## Extract base _Query_

To copy the [_Query_](/api/primitives/query), we need to extract the base [_Query_](/api/primitives/query) that will be used as a template for the new ones:

```ts
const locationQuery = createQuery({
  handler: async ({ locationUrl }) => {
    const response = await fetch(locationUrl);
    return response.json();
  },
});
```

Now, we can copy the `locationQuery` and change only the parameters:

```ts{3-7,9-13}
import { attachOperation } from '@farfetched/core'

const originQuery = attachOperation(locationQuery, {
  mapParams: ({ originUrl }) => ({
    locationUrl: originUrl
  }),
});

const currentLocationQuery = attachOperation(locationQuery, {
  mapParams: ({ currentLocationUrl }) => ({
    locationUrl: currentLocationUrl
  }),
});
```

So, `originQuery` and `currentLocationQuery` are copies of `locationQuery`, they have separate states and can be used independently.

## Additional parameters from external source

If you want to use additional parameters from external source, you can use the `source` field of `attachOperation` config:

```ts{7}
import { createStore } from 'effector';
import { attachOperation } from '@farfetched/core';

const $someExtarnalSource = createStore({});

const currentLocationQuery = attachOperation(locationQuery, {
  source: $someExternalSource,
  mapParams: ({ currentLocationUrl }, valueOfExternalSource) => ({
    locationUrl: currentLocationUrl,
  }),
});
```

In this case, the `valueOfExternalSource` will be equal to the current value of the `$someExternalSource` [_Store_](https://effector.dev/en/api/effector/store/).

## Using `attachOperation` with _Mutations_

The `attachOperation` operator can be used with [_Mutations_](/api/primitives/mutation) as well:

```ts
import { attachOperation } from '@farfetched/core';

const baseMutation = createMutation(/* ... */);
const newMutation = attachOperation(baseMutation);
```

## API reference

You can find the full API reference for the `attachOperation` operator in the [API reference](/api/operators/attach_operation).
