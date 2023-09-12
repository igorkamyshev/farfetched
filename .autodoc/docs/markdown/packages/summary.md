[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages)

The `core` package in the farfetched project is a crucial component that provides a wide range of functionalities, including querying, mutating, caching, error handling, and more. These functionalities are exported in the `index.ts` file and can be utilized throughout the project. For instance, the `createQuery` function can be used to create a query to retrieve data from a data source:

```javascript
import { createQuery } from 'farfetched/core';

const query = createQuery({ /* query parameters */ });
```

The `project.json` file is a configuration file that defines various tasks for the `core` project, such as building, testing, linting, and publishing. These tasks can be executed to automate common development tasks and ensure the quality of the `core` library. For example, the `build` target can be used to build the project:

```bash
nx run core:build
```

The `tsconfig.json` file configures the TypeScript compiler with strict type checking and other helpful options to catch potential errors at compile-time. It also generates declaration files to provide type information for external code.

The `vite.config.ts` file sets up configurations for testing and module resolution. It ensures that type checking is performed during testing but ignores any source errors. It also enables the `tsconfigPaths` plugin to resolve module imports using the paths defined in the TypeScript configuration file.

The `core/src` directory contains crucial modules for caching, library functions, and updating queries and mutations. The `cache.ts` module sets up a caching mechanism for queries, while the `update.ts` module manages and updates queries and mutations. These modules provide key functionalities for the farfetched project. For example, the `update` function can be used to update a query based on a mutation's result:

```javascript
import { update } from 'farfetched/core/src/update';

const query = ...; // define your query
const mutation = ...; // define your mutation
const rules = {
  success: ... // define a rule for handling the success of the mutation
  failure: ... // define a rule for handling the failure of the mutation (optional)
};

update(query, { on: mutation, by: rules });
```

In summary, the `core` package provides a comprehensive set of functionalities for the farfetched project, and its configuration files ensure the quality and integrity of the `core` library.
