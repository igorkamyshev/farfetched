# Contracts

:::tip You will learn

- Why it is important to use [_Contracts_](/api/primitives/contract)
- What [_Contracts_](/api/primitives/contract) can do in Farfetched
- How to create your own [_Contract_](/api/primitives/contract)
- How to use third-party solutions for contracts

:::

We believe that frontend applications [should not trust remote data](/statements/never_trust), it is important to validate data before using it. Farfetched provides a way to validate data using [_Contracts_](/api/primitives/contract).

## What is a [_Contract_](/api/primitives/contract)

In general [_Contract_](/api/primitives/contract) in Farfetched is a simple object with only a few properties that allow application to check any data and decide how it should be treated — as a success response or as a failed one.

Let's take a look at these properties:

- `isData` is a function that takes any data and returns `true` if it is a valid data and `false` otherwise.
- `getErrorMessages` is a function that takes any data and returns an array of strings with description of reasons why data is invalid, it would be called only if `isData` returned `false`.

That's it, any object with these three properties is a [_Contract_](/api/primitives/contract).

::: tip
If you are using TypeScript, `isData` function has to be [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).
:::

## How to create a [_Contract_](/api/primitives/contract)

Of course, you can create your own [_Contract_](/api/primitives/contract) by hand, let's create a simple one together.

```ts
import { type Contract } from '@farfetched/core';

const numberContract: Contract<
  unknown, // it take some unknown data
  number // and returns number if it is valid
> = {
  // it is valid if data is a number
  isData: (data): data is number => typeof data === 'number',
  // if data is not a number,
  // we return an array with description of reasons why data is invalid
  getErrorMessages: (data) => {
    return [`Expected number, got ${typeof data}`];
  },
};
```

So, we created a [_Contract_](/api/primitives/contract) that takes unknown data and checks if it is a number. We can apply this [_Contract_](/api/primitives/contract) to any factory:

```ts
const someQuery = createQuery({
  // ...
  contract: numberContract,
});
```

## Third-party solutions

Even though Farfetched provides a way to create your own [_Contract_](/api/primitives/contract), it's way more convenient to use third-party solutions for contracts.

### Runtypes

We recommend using [Runtypes](https://github.com/pelotom/runtypes), it has first class TS-support, it is well-documented and has a lot of useful features. Farfetched provides [an integration to use Runtype as a Contract](/api/contracts/runtypes).

```ts
import { Number } from 'runtypes';
import { runtypeContract } from '@farfetched/runtypes';

const numberContract = runtypeContract(Number);
```

That is a complete equivalent of the previous example. For such a simple contract, it's not a big deal, but for more complex contracts, it's much more convenient to use Runtypes than to create a contract by hand.

```ts
import { Record, String, Number, Union, Literal } from 'runtypes';

const characterContract = runtypeContract(
  Record({
    id: Number,
    name: String,
    status: Union(Literal('Alive'), Literal('Dead'), Literal('unknown')),
    species: String,
    type: String,
    origin: Record({ name: String, url: Url }),
    location: Record({ name: String, url: Url }),
  })
);
```

### Any other solution

If you are using any other solution for contracts, you can easily create a wrapper for it to case your internal contracts to Farfetched [_Contract_](/api/primitives/contract). Check source code of [Runtypes integration](https://github.com/igorkamyshev/farfetched/blob/master/packages/runtypes/src/runtype_contract.ts) for inspiration.
