# Сontract

A set of constraints that validates received data.

## API reference

```ts
const contract: Contract<unkown, Data, Error>;

// Guards
contract.isData; // (raw: unkown) => raw is Data
contract.isError; // (raw: unkown) => raw is Error

// Validators
contract.getValidationErrors; // (raw: Data) => string[]
```

More information about API can be found in [the source code](../../../packages/core/src/contract/type.ts).
