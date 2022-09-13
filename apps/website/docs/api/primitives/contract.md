# Contract

A rule to statically validate received data.

## API reference

```ts
const contract: Contract<unknown, Data>;

// Guards
contract.isData; // (raw: unknown) => raw is Data

// Validators
contract.getErrorMessages; // (raw: unknown) => string[]
```

More information about API can be found in [the source code](../../../packages/core/src/contract/type.ts).
