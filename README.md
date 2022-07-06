# Farfetched

## Maintains

### Getting started

- clone repo
- install deps via `pnpm install`
- make changes
- make sure that your changes is passing checks:
  - run tests via `pnpm nx affected:test`
  - run linter via `pnpm nx affected:lint`
  - format code via `pnpm nx format:write`
- open a PR
- enjoy 🎉

### Repository management

#### New package creation

```sh
pnpm nx generate @nrwl/js:library --name=NAME --publishable --importPath @farfetched/NAME
```

#### Graph

Run this command to see a diagram of the dependencies of projects.

```sh
pnpm nx graph
```
