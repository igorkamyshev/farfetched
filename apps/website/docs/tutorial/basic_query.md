# Query

::: tip You will learn

- What is a Query
- How to create a Query
- How to extract data from the Query
- How to know current status of the Query

:::

## What is a Query

Farfetched provides a simple way to work with remote data. The minimal piece of remote data is represented by [Query](/api/primitives/query). All you need to know about [Query](/api/primitives/query):

1. it has handler that returns an actual data from the remote source
2. it stores some data inside
   - received data if the handler finished with a success
   - error if the handler finished with a failure
   - status that describes current state of the query
3. it can be started with some parameters

That's it, that is all what you need to know about [Query](/api/primitives/query). Let's create our first [Query](/api/primitives/query)!

## Query creation

Farfetched does not restrict [Query](/api/primitives/query) creation process, so you can create them in any way you want. However, the most common way is to use one of the provided factories. The simplest one is [`createQuery`](/api/factories/create_query), let's start with it.

The basic overload of this factory accepts only a handler function:

```ts
import { createQuery } from '@farfetched/core';

const myFirstQuery = createQuery({
  handler: async (params) => {
    // TODO: write handler here
    return null;
  },
});
```

So `handler` have to be asynchronous function that accepts some parameters and returns some data. Since Farfetched is created for handling remote data, the most common use case of handler is function that calls some API and returns data from it.

:::tip
In this tutorial, we will use [The Rick and Morty API](https://rickandmortyapi.com) for examples. You can use any API you want, but we recommend you to use this one because it is simple and has plenty of endpoints.
:::

Let's create a [Query](/api/primitives/query) that represents a single character from the API by character ID:

```ts
const characterQuery = createQuery({
  handler: async ({ id }) => {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);

    return response.json();
  },
});
```

That's it, we have created our first [Query](/api/primitives/query)! Now we can start it with some parameters:

```ts
characterQuery.start({ id: 1 });
```

After this call [Query](/api/primitives/query) will start its handler with the given parameters and store the result inside. But how can we get this result?

## Data extraction

Farfetched is built as a reactive library, so all data is stored inside [Stores](https://effector.dev/en/api/effector/store/). [Query](/api/primitives/query) is no exception, it stores result of the request inside [Stores](https://effector.dev/en/api/effector/store/) in field `.$data`, in the most common use case you will subscribe on this field to get the result:

```ts
characterQuery.$data.watch((data) => {
  // render some UI based on data
});
```

Whoa whoa whoa, wait! Direct watchers? Are we in 2010? Do not worry, it is just an example.

Farfetched provided a set of nice integrations to subscribe on [Query](/api/primitives/query) in the most popular UI frameworks.

:::details Solid

In Solid, you can use [`createQueryResource`](/api/ui/solid) to create a resource that will subscribe on [Query](/api/primitives/query) and provide its data to the component:

```tsx
import { createQueryResource } from '@farfetched/solid';

const Character = () => {
  const [character] = createQueryResource(characterQuery);

  return (
    <Suspense fallback="Loading...">
      <h1>{character()?.name}</h1>
      <img src={character()?.image} />
    </Suspense>
  );
};
```

Read more in [Solid-specific](/tutorial/solid/) tutorial.

:::

::: details React

In React, you can use [`useUnit`](https://effector.dev/en/api/effector-react/useunit/) hook to subscribe on [Query](/api/primitives/query) and get its data:

```tsx
import { useUnit } from 'effector-react';

const Character = () => {
  const { data: character } = useUnit(characterQuery);

  if (!character) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{character.name}</h1>
      <img src={character.image} />
    </div>
  );
};
```

Read more in [React-specific](/tutorial/react/) tutorial.

:::

To extract error from [Query](/api/primitives/query), you can subscribe on `.$error` or use your favorite integration as well.

::: tip
It can be useful to have a visual representation of the state of the [_Query_](/api/primitives/query). You can use Farfetched DevTools for this purpose. Read more in [DevTools](/tutorial/devtools) tutorial.
:::

## Query status

Since [Query](/api/primitives/query) is an asynchronous operation, you can use `.$status` to get current status of the query. It is a [Store](https://effector.dev/en/api/effector/store/) that contains one of the following statuses: "initial", "pending", "success" or "error".

::: info
All integrations provide a convenient way to subscribe on `.$status` in the UI as well.
:::
