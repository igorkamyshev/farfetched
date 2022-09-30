# Roadmap

Farfetched is under development now, before the first stable release we are going to provide solutions for plenty of common cases. This roadmap displays the list of planned features and its order. It could change a bit, but in general, we will follow it.

## The next release

### v.0.3 Sirinat

- Initial value for _Query_
- Declarative cache
- `update` operator

## Future releases

### v.0.4

- GraphQL add-on — `@farfetched/graphql`
  - `createGraphQLQuery`
  - `createGraphQLMutation`
  - optional auto-batching
  - import, parsing, and usage of schema
  - automatic optimistic update for Query based on Mutation and schema

### v.0.5

- Add-on with DevTools — `@farfetched/dev-tools`

### v.0.6

- Add-on for pagination and infinite scroll

### v.0.8

- Triggers API to mark data as stale and re-fetch on some declarative triggers.
- Add-on `@farfetched/web-api` with common triggers
  - internet connectivity after lost
  - tab focus
- timer triggers
- explicit triggers
- migrate Mutation API to Triggers API
- migrate `connectQuery` to Triggers API

### v.0.9

- WebSocket
- Server Sent Events
- HTTP Polling

### v.0.10

- Add-on `@farfetched/rest`
  - `createREST` — return set of Queries and Mutations for typical REST API
