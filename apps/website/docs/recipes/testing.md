# Unit tests

::: info
For better testing experience, we recommend reading article about [SIDs](https://effector.dev/en/explanation/sids/)
:::

Farfetched offers a couple of features to simplify writing unit tests.

Foremost, it allows mocking any fetcher function of any Query without special instruments. Let us see 👇

```ts
const locationQuery = createQuery({ handler: /* some fetcher function */ })

test('let us mock function', async () => {
    const scope = fork({ handlers: [
        [locationQuery.__.executeFx, () => 'Mocked'],
    ]})

    // in returned scope locationQuery will be using provided function as a handler
})
```

## What is "scope"?

[_Scope_](https://effector.dev/en/api/effector/scope/) is an isolated instance of the whole application. It can be used for SSR and testing purposes.

To create new [_Scope_](https://effector.dev/en/api/effector/scope/) you can use [`fork`](https://effector.dev/en/api/effector/fork/) function.

```ts
const scope = fork();
```

This API has an important feature for testing. You can replace any handler in the application during fork. Let us use it for replacing handlers in tests.

```ts
const locationQuery = createQuery({ handler: /* some fetcher function */ })

test('let us mock function', async () => {
    const scope = fork({ handlers: [
        [locationQuery.__.executeFx, () => 'Mocked'],
    ]})

    // in returned scope locationQuery will be using provided function as a handler
})
```

## Wait for all computations

So, we have created an isolated instance of our application with fake handlers. Now we have to start Query and wait for all computations settled. There is special function for this purpose — [`allSettled`](https://effector.dev/en/api/effector/allsettled/).

```ts
const locationQuery = createQuery({ handler: /* some fetcher function */ })

test('let us mock function', async () => {
    const scope = fork({ handlers: [
        [locationQuery.__.executeFx, () => 'Mocked'],
    ]})

    await allSettled(locationQuery.refresh, { scope })

    // all computations are settled
})
```

It does not matter how many Queries you have connected to the original one. `allSetteld` provides a guarantee that all computations are settled. It means you can read values from the [_Scope_](https://effector.dev/en/api/effector/scope/) and compare it with expected ones.

```ts
const locationQuery = createQuery({ handler: /* some fetcher function */ })

test('let us mock function', async () => {
    const scope = fork({ handlers: [
        [locationQuery.__.executeFx, () => 'Mocked'],
    ]})

    await allSettled(locationQuery.refresh, { scope })

    expect(scope.getState(locationQuery.$data)).toBe('Mocked')
})
```

## Isolation

As was mentioned before, Scope is a completely isolated instance of the application. So, you can run as many tests as you want in parallel, they will not affect each other.
