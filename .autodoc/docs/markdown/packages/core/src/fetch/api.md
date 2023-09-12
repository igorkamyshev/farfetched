[View code on GitHub](https://github.com/igorkamyshev/farfetched/packages/core/src/fetch/api.ts)

The code provided is a module that defines a function called `createApiRequest`. This function is used to create an API request handler with customizable settings. The purpose of this code is to provide a flexible and reusable way to make API requests and handle the responses.

The `createApiRequest` function takes in a configuration object that specifies the request and response settings. The configuration object has several interfaces and types defined within the code, such as `StaticOnlyRequestConfig`, `ExclusiveRequestConfig`, `InclusiveRequestConfig`, etc. These interfaces define the structure and types of the request and response settings.

The `createApiRequest` function returns an effect function called `boundAbortableApiRequestFx`. This effect function is responsible for making the actual API request and handling the response. It takes in the request parameters and an abort context, and returns a result or an error.

The code also defines other helper functions and types, such as `attach`, `sample`, `abortable`, `formatUrl`, `formatHeaders`, etc. These functions and types are used internally by the `createApiRequest` function to handle various aspects of the API request and response, such as formatting the URL and headers, handling concurrency and abort settings, transforming the response, and handling errors.

Overall, this code provides a flexible and customizable way to make API requests and handle the responses. It can be used in a larger project to create API request handlers with different settings and behaviors, such as handling concurrent requests, setting timeouts, transforming responses, and handling errors. Here's an example of how the `createApiRequest` function can be used:

```javascript
const getUserRequest = createApiRequest({
  request: {
    method: 'GET',
    url: '/users/{id}',
    query: { include: 'profile' },
  },
  response: {
    extract: (response) => response.json(),
  },
});

getUserRequest({ id: 123 })
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.error(error);
  });
```

In this example, the `getUserRequest` function is created with a specific request configuration that specifies the HTTP method, URL, and query parameters. The response configuration specifies that the response should be extracted as JSON. The `getUserRequest` function is then called with the user ID as a parameter, and the resulting user data is logged to the console. Any errors that occur during the request or response handling are caught and logged to the console as well.
## Questions: 
 1. **What is the purpose of the `createApiRequest` function?**
The `createApiRequest` function is used to create an API request with configurable settings for handling the request and response.

2. **What are the different types of HTTP methods that can be used in the `HttpMethod` type?**
The `HttpMethod` type includes the following HTTP methods: 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'QUERY', 'OPTIONS'.

3. **What is the purpose of the `ApiConfig` interface?**
The `ApiConfig` interface is used to define the configuration settings for creating and handling API requests, including the request rules and response handling.