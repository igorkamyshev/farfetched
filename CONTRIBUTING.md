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

After documentation and tests are ready, you can start implementing the feature. Please ensure that your implementation is passing all checks. You can run them via `pnpm local_check` to get quicker feedback than CI.

### Changeset

After implementation is ready, you have to fill in changes via `pnpm changeset`. It will create a new changeset in the `changes` directory. Changesets are accepted in English only. It will be used for versioning and changelog generation.
