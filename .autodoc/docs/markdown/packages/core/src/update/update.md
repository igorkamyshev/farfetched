[View code on GitHub](https://github.com/igorkamyshev/farfetched/packages/core/src/update/update.ts)

The code provided is a part of the "farfetched" project and contains functions and types related to updating and managing queries and mutations. 

The `update` function is the main function in this code. It takes a query and an object containing a mutation and rules for handling the success and failure of the mutation. The purpose of this function is to update the query state based on the result of the mutation and apply any necessary refetching logic.

Here is an example of how the `update` function can be used:

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

Inside the `update` function, several events and splits are created to handle the different scenarios. The `fillQueryData` and `fillQueryError` events are used to fill the query data and error respectively. The `split` function is used to split the source based on the result of the mutation and apply the appropriate rule. If the rule returns a non-empty result, the `fillQueryData` event is triggered, otherwise the `fillQueryError` event is triggered.

After filling the query data or error, the `sample` function is used to push the data or error to the query's low-level API. This allows the query to update its state and trigger any subscribed callbacks.

The code also includes logic for refetching. The `shouldRefetch` and `shouldNotRefetch` splits are used to determine whether a refetch is needed based on the `refetch` property in the payload of the `fillQueryData` and `fillQueryError` events. If a refetch is needed, the `revalidate` method of the query's low-level API is called with the appropriate parameters.

The `queryState` function is a helper function that creates a store representing the state of the query. It combines the query's data, parameters, error, and failed status into a single object and returns a store that updates whenever any of these values change.

Overall, this code provides a way to update and manage queries and mutations in the "farfetched" project. It handles the success and failure of mutations, updates the query state, and allows for refetching when necessary.
## Questions: 
 1. What is the purpose of the `update` function?
- The `update` function is used to update the state of a query based on the result or error of a mutation.

2. What is the purpose of the `fillQueryData` and `fillQueryError` events?
- The `fillQueryData` event is used to fill the query state with the result of a successful mutation, while the `fillQueryError` event is used to fill the query state with the error of a failed mutation.

3. What is the purpose of the `shouldRefetch` and `shouldNotRefetch` splits?
- The `shouldRefetch` split is used to determine if a query should be refetched based on the `refetch` property in the payload of the `fillQueryData` or `fillQueryError` events. The `shouldNotRefetch` split is used to determine if a query should not be refetched.