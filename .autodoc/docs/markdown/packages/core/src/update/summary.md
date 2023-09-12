[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/core/src/update)

The `update.ts` file in the `farfetched` project is a crucial component that manages and updates queries and mutations. It contains the `update` function, which is the main function in this code. This function takes a query and an object containing a mutation and rules for handling the success and failure of the mutation. The purpose of this function is to update the query state based on the result of the mutation and apply any necessary refetching logic.

```javascript
import { update } from 'farfetched';

const query = ...; // define your query
const mutation = ...; // define your mutation
const rules = {
  success: ... // define a rule for handling the success of the mutation
  failure: ... // define a rule for handling the failure of the mutation (optional)
};

update(query, { on: mutation, by: rules });
```

The `update` function creates several events and splits to handle different scenarios. The `fillQueryData` and `fillQueryError` events are used to fill the query data and error respectively. The `split` function is used to split the source based on the result of the mutation and apply the appropriate rule. If the rule returns a non-empty result, the `fillQueryData` event is triggered, otherwise the `fillQueryError` event is triggered.

After filling the query data or error, the `sample` function is used to push the data or error to the query's low-level API. This allows the query to update its state and trigger any subscribed callbacks.

The code also includes logic for refetching. The `shouldRefetch` and `shouldNotRefetch` splits are used to determine whether a refetch is needed based on the `refetch` property in the payload of the `fillQueryData` and `fillQueryError` events. If a refetch is needed, the `revalidate` method of the query's low-level API is called with the appropriate parameters.

The `queryState` function is a helper function that creates a store representing the state of the query. It combines the query's data, parameters, error, and failed status into a single object and returns a store that updates whenever any of these values change.

In summary, `update.ts` provides a way to manage queries and mutations in the `farfetched` project. It handles the success and failure of mutations, updates the query state, and allows for refetching when necessary.
