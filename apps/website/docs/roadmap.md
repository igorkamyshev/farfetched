# Roadmap

Since Farfetched [v0.12](/releases/0-12) we declare feature freeze and focus on stability and performance improvements. We are going to release a new version every 2-3 months and finish the development of Farfetched 1.0 by the end of 2024.

## Future releases

### v0.14

- Delete `attachOperation` according to [the ADR](/adr/attach_operation_deprecation)
- Delete `concurrency` field in `creteJsonQuery` and `createJsonMutation` according to [the ADR](/adr/concurrency)

### v0.x

The following changes are planned for some releases **before** Farfetched 1.0, but we are not sure about the exact version:

- Specification of behavior for many operators of the single type applied to the single operation
- Merge of `contract` and `validate` fields in all built-in factories
- DX improvements for `update` operator

### v1.x

The following features are planned for some releases **after** Farfetched 1.0, but we are not sure about the exact version:

- Code generation based on the API schema
- Built-in support for GraphQL and REST APIs
- Support for SSE and Web Sockets
