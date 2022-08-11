# Farfetched

The advanced data fetching tool for web applications

## Quick Features

- Transport/protocol/backend agnostic (REST, GraphQL, promises, whatever!)
- Framework-agnostic (React, Solid, Vue, Svelte, Angular, whatever!)
- Declarative — expresses the logic of a computation without describing its control flow

## How To

1. Install `farfethed` and its peer dependencies

with `pnpm`

```sh
pnpm install @farfecthed/core effector
```

with `yarn`

```sh
yarn add @farfecthed/core effector
```

with `npm`

```sh
npm install @farfecthed/core effector
```

2. Create a _Query_

```ts
const languageListQuery = createQuery({
  handler: async () =>
    fetch('https://api.salo.com/languages.json').then((res) => res.json()),
});
```

3. Use _Query_ in the application

```ts
// view.ts

// Subscribe on the received data
languageListQuery.$data.watch((languages) => {
  renderLanguageList(languages);
});

// Subscribe on the received error
languageListQuery.$error.watch((error) => {
  renderErrorScreen(error);
});

// Start execution
languageListQuery.start();
```

4. You are gorgeous! A Query starts right after `start` call, when it has done, callback in `watch` will be executed with received data.

### Documentation

Continue reading about Farfetched in the [documentation](./docs/README.md). It covers integration with the most popular UI-frameworks (such React, Solid.js and Vue.js), error handling, dependent Queries, more advanced contracts and other great tools.

## Maintains

### Getting started

- clone repo
- install deps via `pnpm install`
- make changes
- make sure that your changes is passing checks:
  - run tests via `pnpm test`
  - run type tests via `pnpm test:types`
  - run linter via `pnpm lint`
  - try to build it via `pnpm build`
  - format code via `pnpm format`
- fill in changes via `pnpm changes`
- open a PR
- enjoy 🎉

### Release workflow

Releases of Farfetched are automated by [changesets](https://github.com/changesets/changesets) and GitHub Actions. Your only duty is creating changeset for every PR, it is controlled by [Changes-action](./.github/workflows/changes.yml).

After merging PR to master-branch, [Version-action](./.github/workflows/version.yml) will update special PR with the next release. To publish this release, just merge special PR and wait, [Release-action](./.github/workflows/release.yml) will publish packages.

### Repository management

#### New package creation

```sh
pnpm nx generate @nrwl/js:library --name=NAME --importPath @farfetched/NAME
```

#### Graph

Run this command to see a diagram of the dependencies of projects.

```sh
pnpm nx graph
```

## Credits

Farfetched powered by [Aviasales](https://aviasales.com).

Special thanks to all contributors and especially [Alexandr](https://github.com/AlexandrHoroshih) for endless patience during our debates about this library.

Some of external libraries were inlined to Farfecthed due to bundle size and custom features requirements:

- https://github.com/jacobheun/any-signal
- https://github.com/jacobheun/timeout-abort-controller/
- https://github.com/effector/patronum/pull/168
