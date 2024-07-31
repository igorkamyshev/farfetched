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
  unknown, // it takes some unknown data
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

### `@withease/contracts`

We recommend using [`@withease/contracts`](https://withease.effector.dev/contracts/) as a default solution for contracts. It is extremely lightweight, has a lot of useful features and is well-documented. Futhermore, it is a part of Effector's family, so it is well-integrated with any Effector-based solution and does not require any additional compatibility layers.

```ts
import { num } from '@withease/contracts';

const someQuery = createQuery({
  // ...
  contract: num,
});
```

Let us write a more complete equivalent of the previous example. For such a simple contract, it's not a big deal, but for more complex contracts, it's much more convenient to use `@withease/contracts` than to create a contract by hand.

```ts
import { obj, str, num, or, val } from '`@withease/contracts`';

const characterContract = obj({
  id: num,
  name: str,
  status: or(val('Alive'), val('Dead'), val('unknown')),
  species: str,
  type: str,
  origin: obj({ name: str, url: str }),
  location: obj({ name: str, url: str }),
});
```

## Other integrations

In case you are using some other solution for contracts, Farfetched provides a plenty of integrations for the following third-party solutions:

- [Runtypes](/api/contracts/runtypes)
- [Zod](/api/contracts/zod)
- [io-ts](/api/contracts/io-ts)
- [Superstruct](/api/contracts/superstruct)
- [typed-contracts](/api/contracts/typed-contracts)
- [Valibot](/api/contracts/valibot)

If you are using any other solution for contracts, you can easily create a wrapper for it to case your internal contracts to Farfetched [_Contract_](/api/primitives/contract). Check source code of [Runtypes integration](https://github.com/igorkamyshev/farfetched/blob/master/packages/runtypes/src/runtype_contract.ts) for inspiration.
