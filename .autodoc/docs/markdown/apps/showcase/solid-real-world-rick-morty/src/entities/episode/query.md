[View code on GitHub](https://github.com/igorkamyshev/farfetched/apps/showcase/solid-real-world-rick-morty/src/entities/episode/query.ts)

The code provided is a part of the farfetched project and it defines three functions: `episodeQuery`, `episodeListQuery`, and `episodePageQuery`. These functions are used to create JSON queries for retrieving information about episodes.

The `createJsonQuery` function is imported from the `@farfetched/core` module and is used to create a JSON query object. It takes an object as an argument with the following properties:
- `params`: This property is used to declare the parameters required for the query. In this code, the `declareParams` function is used to declare the parameters. The `episodeQuery` function requires a single parameter `id` of type `TId`, the `episodeListQuery` function requires a parameter `ids` which is an array of `TId`, and the `episodePageQuery` function requires a parameter `page` of type `number`.
- `request`: This property is used to define the request details for the query. It includes the URL, method, and query parameters if applicable. The URL is generated using the `episodeUrl` function from the `./api` module. The method is set to 'GET' for all three functions. The `episodePageQuery` function also includes a query parameter `page` which is generated based on the `page` parameter.
- `response`: This property is used to define the expected response structure for the query. It includes the contract for the response data. The `runtypeContract` function from the `@farfetched/runtypes` module is used to define the contract. The `episodeQuery` function expects a response of type `Episode`, the `episodeListQuery` function expects a response of type `Array(Episode)`, and the `episodePageQuery` function expects a response of type `Record({ info: Info, results: Array(Episode) })`.

These functions can be used in the larger project to make API requests for retrieving episode information. For example, the `episodeQuery` function can be used to retrieve information about a specific episode by providing the episode ID as a parameter. The `episodeListQuery` function can be used to retrieve information about multiple episodes by providing an array of episode IDs as a parameter. The `episodePageQuery` function can be used to retrieve a page of episodes by providing the page number as a parameter.

Here are some examples of how these functions can be used:

```javascript
const episodeInfo = await episodeQuery({ id: '123' });
console.log(episodeInfo);

const episodeList = await episodeListQuery({ ids: ['123', '456', '789'] });
console.log(episodeList);

const episodePage = await episodePageQuery({ page: 1 });
console.log(episodePage);
```

Overall, this code provides a convenient way to create JSON queries for retrieving episode information in the farfetched project.
## Questions: 
 1. **What is the purpose of the `createJsonQuery` function?**
The `createJsonQuery` function is used to create a JSON query object that defines the parameters, request details, and response contract for making API requests.

2. **What is the purpose of the `runtypeContract` function?**
The `runtypeContract` function is used to create a contract that defines the expected structure and types of the response data from an API request.

3. **What is the purpose of the `declareParams` function?**
The `declareParams` function is used to declare the expected parameters for an API request, such as `id`, `ids`, or `page`, and their corresponding types.