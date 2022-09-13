# Contract

A rule to statically validate received data.

## API reference

```ts
const contract: Contract<unkown, Data, Error>;

// Guards
contract.isData; // (raw: unkown) => raw is Data

// Validators
contract.getErrorMessages; // (raw: Data) => string[]
```

More information about API can be found in [the source code](../../../packages/core/src/contract/type.ts).
