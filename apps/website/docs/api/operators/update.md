# `update` <Badge type="tip" text="since v0.3.0" />

Creates static connection between [_Mutation_](../primitives/mutation) and [_Query_](../primitives/query). It updates data of the [_Query_](../primitives/query) on top of the [_Mutation_](../primitives/mutation) result.

## Formulae

### `update(config)`

Config fields:

- `mutation` - [_Mutation_](../primitives/mutation) to update with
- `query` - [_Query_](../primitives/query) to update
- `bySuccess` ...
- `byError` ...
