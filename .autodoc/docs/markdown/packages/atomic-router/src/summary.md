[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/atomic-router/src)

The `atomic-router/src` folder in the `farfetched` project contains TypeScript modules that define and manage chains of events. These chains of events are used to handle different stages of processes such as fetching data from an API, processing the data, and displaying it to the user.

The `chain.protocol.ts` file defines a `ChainProtocol` type that represents a protocol for a chain of events. This type is a generic type that takes a type parameter `RouteParams`, which represents a set of route parameters. The `ChainProtocol` type has three properties: `beforeOpen`, `openOn`, and `cancelOn`, which represent different stages of the chain of events.

The `defer.ts` file exports a function called `createDefer` and a type called `Defer`. The `createDefer` function creates and returns an instance of the `Defer` type, which represents a controlled promise. This allows for more fine-grained control over the resolution and rejection of a promise.

The `fresh.ts` file exports a function called `freshChain` that creates a chain of events for handling the process of refreshing data. The `freshChain` function sets up three events: `beforeOpen`, `openOn`, and `cancelOn`, which are used to trigger different actions at different stages of the data refresh process.

The `start.ts` file contains a function called `startChain` that initializes a chain of events and returns an object that contains three events: `beforeOpen`, `openOn`, and `cancelOn`. These events are used to handle different stages of a query process.

These modules can be used in the larger `farfetched` project to define and enforce a consistent protocol for chains of events. For example, the `ChainProtocol` type can be used to define the protocol for a series of actions that need to occur in a specific order. The `createDefer` function can be used to create controlled promises, which can be useful in scenarios where precise control over asynchronous operations is required. The `freshChain` and `startChain` functions can be used to set up chains of events for handling data refresh and query processes, respectively.
