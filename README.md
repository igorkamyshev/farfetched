# Farfetched

<img align="right" width="174" height="180" title="Farfetched logotype"
     src="./apps/website/docs/public/logo.svg">

![minified and gzipped size badge](https://badgen.net/bundlephobia/minzip/@farfetched/core)

The advanced data fetching tool for web applications

## Quick Features

- Transport/protocol/backend agnostic (REST, GraphQL, promises, whatever!)
- Framework-agnostic (React, Solid, Vue, Svelte, Angular, whatever!)
- Declarative — expresses the logic of a computation without describing its control flow
- First class TypeScript support out of the box
- Focused to improve both developer and user experiences

### Documentation

Continue reading about Farfetched in the [documentation](https://farfetched.pages.dev). It covers integration with the most popular UI-frameworks (such React and Solid), error handling, dependent queries, advanced contracts and other great tools.

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

Some of external libraries were inlined to Farfetched due to bundle size and custom features requirements:

- https://github.com/jacobheun/any-signal
- https://github.com/jacobheun/timeout-abort-controller/
- https://github.com/effector/patronum
- https://github.com/effector/patronum/pull/168
- https://github.com/emn178/js-sha1/blob/master/tests/test.js
- http://www.movable-type.co.uk/scripts/sha1.html
