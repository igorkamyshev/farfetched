# Contributing to Farfetched

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

The following is a set of guidelines for contributing to Farfetched. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Basics

### Architecture review

Any new feature or change should be discussed with maintainers via issue with RFC. It will help to avoid unnecessary work and make sure that the feature will be accepted. RFCs are accepted in English and Russian languages.

After discussion, RFC should be transformed to an ADR in the `apps/website/adr` directory. It will be a part of the documentation. ADRs are accepted in English only.

### Documentation first

Any new feature or change should be documented. It is a part of the feature itself. Documentation should be placed in the `apps/website/docs` directory. It is written in Markdown and accepted in English only.

### Tests second

Any new feature or change should be covered by tests. It is a part of the feature itself. Tests have to cover runtime implementation **and** TypeScript types declarations. Farfetched uses [Vitest](https://vitest.dev/) as a test runner, please refer to its documentation for more information.

### Implementation last

After documentation and tests are ready, you can start implementing the feature. Please ensure that your implementation is passing all checks. You can run them via `pnpm ci:local` to get quicker feedback than CI.

### Changeset

After implementation is ready, you have to fill in changes via `pnpm changeset`. It will create a new changeset in the `.changeset` directory. Changesets are accepted in English only. It will be used for versioning and changelog generation.

## How to create a good API

While writing RFC, keep in mind that the new API (or changes in the existing API) should be consistent with the following principles:

1. Solve a real problem. The new feature should solve a real problem that is faced by developers. You have to provide a clear example of the problem and how the new feature solves it.
2. Be consistent. The new feature should be consistent with the existing API. It should not introduce new concepts or patterns that are not used in the existing API unless it is necessary.
3. Simple solutions for simple problems, complex solutions for complex problems. Not vice versa.

Read existing [ADRs](https://farfetched.pages.dev/adr/) to get an understanding of the existing API and principles.

## How to create a good implementation

While writing code, keep in mind that Farfetched is a library that is focused on developer and user experiences. Moreover, Farfetched is based on [Effector](https://effector.dev/) and has to be consistent with its principles and APIs. There are some tips that will help you to create a good implementation:

1. Fork API is a key. Any feature should support Fork API.
2. Performance is important. Avoid unnecessary computations and slow algorithms.
3. TypeScript is a must. Ensure that your implementation is typed correctly.
4. Declarative API > Imperative API. Users should be able to express the logic of a computation without describing its control flow using your feature.

## General advice

- Respect [`.nvmrc`](./.nvmrc) file. We cannot guarantee that Farfetched will work with other Node.js versions.
- Respect `packageManager` field in [`package.json`](./package.json).
- Keep PRs on-topic. If you want to introduce two unrelated changes, please create two separate PRs.
