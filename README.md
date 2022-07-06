# Farfetched

## Quick Features

- Transport/protocol/backend agnostic (REST, GraphQL, promises, whatever!)
- Framework-agnostic (React, Solid, Vue, Svelte, Angular, whatever!)

## How To

1. Install `farfethed` and its peer dependencies

with `pnpm`

```sh
pnpm install effector @farfecthed/core
```

with `yarn`

```sh
yarn add effector @farfecthed/core
```

with `npm`

```sh
npm install effector @farfecthed/core
```

2. Create a _Query_

```ts
const languageListQuery = createJsonQuery({
  // Declare that the Query should be called with `limit` parameter
  params: declareParams<{ limit: number }>(),
  request: {
    // Define the request URL
    url: 'https://api.salo.com/languages.json',
    // Transform Query parameters to search params of the request
    query: (params) => new URLSearchParams({ limit: params.limit }),
  },
  response: {
    // Do not validate response
    contract: unkownContract,
  },
});
```

3. Use _Query_ in the application

```ts
// view.ts

// Subscribe on the received data
languageListQuery.$data.watch((languages) => {
  renderLanguageList(languages);
});

// Start execution
languageListQuery.start({ limit: 10 });
```

4. You are gorgeous! A Query starts right after `start` call, when it has done, callback in `watch` will be executed with received data.

## Documentation

Continue reading about `farfetched` in the [documentation](./docs/README.md). It covers integration with the most popular UI-frameworks (such React, Solid.js and Vue.js), error handling, dependent Queries, more advanced contracts and other great tools.

## Maintains

### Getting started

- clone repo
- install deps via `pnpm install`
- make changes
- make sure that your changes is passing checks:
  - run tests via `pnpm nx affected:test`
  - run linter via `pnpm nx affected:lint`
  - format code via `pnpm nx format:write`
  - type correctness via `pnpm typecheck`
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
