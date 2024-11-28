---
outline: [2, 3]
---

# TypeScript

Farfetched is going to provide first-class support of TypeScript types. It is written in TypeScript, and it has a lot of type-tests. However, TypeScript itself does not aim for [apply a sound or "provably correct" type system](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Design-Goals#non-goals), instead it strikes a balance between correctness and productivity. So, we cannot guarantee that all the types are correct, but we are going to do our best to provide the best possible types.

## Known issues

TS itself has some limitations, and Farfetched is not an exception, we cannot fix this issues, but we can provide some workarounds. Here is a list of known issues:

### `declareParams`

It is recommended to use `type` instead of `interface` in `declareParams`, because `interface` can break the type inference in [some cases](https://github.com/igorkamyshev/farfetched/issues/266). The exhaustive reasons of the issue could be found in the [answer on StackOverflow](https://stackoverflow.com/questions/55814516/typescript-why-type-alias-satisfies-a-constraint-but-same-interface-doesnt).
