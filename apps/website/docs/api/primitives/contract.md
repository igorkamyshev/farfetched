# Contract

::: tip
Farfetched follows [_Contract_ protocol](https://withease.pages.dev/protocols/contract.html).
:::

A rule to statically validate received data.

## API reference

```ts
const contract: Contract<unknown, Data>;

// Guards
contract.isData; // (raw: unknown) => raw is Data

// Validators
contract.getErrorMessages; // (raw: unknown) => string[]
```

More information about API can be found in [the source code](https://github.com/igorkamyshev/farfetched/blob/master/packages/core/src/contract/type.ts).
