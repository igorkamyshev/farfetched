# Mutation

::: tip You will learn

- What is a Mutation
- How to create a Mutation
- How to use the result of the Mutation
- How to know current status of the Mutation

:::

## What is a _Mutation_

Since we have an abstraction to retrieve data from the remote source, we have to have an abstraction to send data to the remote source. Farfetched provides [_Mutations_](/api/primitives/mutation) for this purpose. All you need to know about [_Mutation_](/api/primitives/mutation):

1. it has handler that performs operation on the remote source
2. it does not store any data inside, it provides only lifecycle [_Events_](https://effector.dev/en/api/effector/event/)
3. it can be started with some parameters

That's it, that is all what you need to know about [Mutation](/api/primitives/mutation). Let's create our first [Mutation](/api/primitives/mutation)!

## _Mutation_ creation

Farfetched does not restrict [_Mutation_](/api/primitives/mutation) creation process, so you can create them in any way you want. However, the most common way is to use one of the provided factories. The simplest one is [`createMutation`](/api/factories/create_mutation), let's start with it.

The basic overload of this factory accepts only a handler function:

```ts
import { createMutation } from '@farfetched/core';

const myFirstMutation = createMutation({
  handler: async (params) => {
    // TODO: write handler here
    return null;
  },
});
```

So `handler` has to be asynchronous function that accepts some parameters and performs some work. It can return some data or does not return it. Since Farfetched is created for handling remote data, the most common use case of handler is function that calls some API.

::: info

As you can see, the [_Mutation_](/api/primitives/mutation) is really close to [_Query_](/api/primitives/query). The only difference is that [_Mutation_](/api/primitives/mutation) has to perform some work on the remote source while [_Query_](/api/primitives/query) only retrieves data from it.

:::

Let's create some mutation to create a new entity in the API:

```ts
const createEntityMutation = createMutation({
  handler: async ({ name, id }) => {
    const response = await fetch(`https://api.salo.com/api/`, {
      method: 'POST',
      body: JSON.stringify({ name, id }),
    });

    return response.json();
  },
});
```

That's it, we have created our first [_Mutation_](/api/primitives/mutation)! Now we can start it with some parameters:

```ts
createEntityMutation.start({ id: 1, name: 'Some new name' });
```

After this call [Mutation](/api/primitives/mutation) will start its handler with the given parameters and store the result inside. But how will we know this result?

## _Mutation_ result

Since [_Mutation_](/api/primitives/mutation) does not store any data inside, it provides only lifecycle [_Events_](https://effector.dev/en/api/effector/event/). The most important of them are `finished.success` and `finished.failure`. Let's subscribe to these events:

```ts
createEntityMutation.finished.success.watch(({ params, data }) => {
  showNotification({
    message: `Entity ${params.id} was created!`,
    type: 'info',
  });
});

createEntityMutation.finished.failure.watch(({ params, data }) => {
  showNotification({
    message: `Entity ${params.id} was not created!`,
    type: 'error',
  });
});
```

::: info
`showNotification` is a function that shows notification to the user. It is not related to Farfetched in any way, it is just an example.
:::

In real applications, we assume that the result of the [_Mutation_](/api/primitives/mutation) will be used as a part of business logic, consider using [Effector](https://effector.dev) to describe your control flow.

## _Mutation_ status

Since [_Mutation_](/api/primitives/mutation) is an asynchronous operation, you can use `.$status` to get current status of the operation. It is a [Store](https://effector.dev/en/api/effector/store/) that contains one of the following statuses: "initial", "pending", "success" or "fail".
