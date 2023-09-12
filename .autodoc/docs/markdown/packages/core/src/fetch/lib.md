[View code on GitHub](https://github.com/igorkamyshev/farfetched/packages/core/src/fetch/lib.ts)

The code provided in the `farfetched` file contains several functions that are used for manipulating and formatting data related to API requests. These functions can be used in the larger project to handle various aspects of making API requests, such as merging API records, merging query strings, formatting headers, and formatting URLs.

The `mergeRecords` function takes in multiple API records as arguments and merges them into a single record. It iterates over each record and checks if it is an object. If it is, it iterates over the key-value pairs of the record and merges them into the `final` record. If a key already exists in the `final` record, the values are merged into an array. Otherwise, the value is assigned directly to the key.

Example usage:
```typescript
const record1 = { name: 'John', age: 25 };
const record2 = { name: 'Jane', email: 'jane@example.com' };
const mergedRecord = mergeRecords(record1, record2);
console.log(mergedRecord);
// Output: { name: ['John', 'Jane'], age: 25, email: 'jane@example.com' }
```

The `mergeQueryStrings` function takes in multiple query strings as arguments and merges them into a single query string. It iterates over each query string and checks if it is a string. If it is not, it converts the query record to a URLSearchParams object and appends it to the `final` array. Finally, it joins all the query strings in the `final` array with an ampersand (&) separator.

Example usage:
```typescript
const queryString1 = 'name=John&age=25';
const queryString2 = { email: 'jane@example.com' };
const mergedQueryString = mergeQueryStrings(queryString1, queryString2);
console.log(mergedQueryString);
// Output: 'name=John&age=25&email=jane@example.com'
```

The `formatHeaders` function takes in a headers record and formats it into a Headers object. It iterates over each key-value pair in the headers record and appends the values to the corresponding key in the Headers object. If a value is an array, it appends each value individually.

Example usage:
```typescript
const headersRecord = { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' };
const headers = formatHeaders(headersRecord);
console.log(headers.get('Content-Type'));
// Output: 'application/json'
console.log(headers.get('Authorization'));
// Output: 'Bearer token'
```

The `formatUrl` function takes in a base URL and a query record or query string and formats them into a complete URL. If the query record is an object, it converts it to a URLSearchParams object and appends it to the base URL. If the query record is a string, it appends it directly to the base URL. The resulting URL is returned.

Example usage:
```typescript
const baseUrl = 'https://api.example.com/users';
const queryRecord = { name: 'John', age: 25 };
const formattedUrl = formatUrl(baseUrl, queryRecord);
console.log(formattedUrl);
// Output: 'https://api.example.com/users?name=John&age=25'
```

The `recordToUrlSearchParams` function takes in an API record and converts it to a URLSearchParams object. It iterates over each key-value pair in the record and appends the values to the corresponding key in the URLSearchParams object. If a value is an array, it appends each value individually.

The `clearValue` function is a helper function that takes in a value and returns a cleared value. If the value is a number or boolean, it is converted to a string. Otherwise, the value is returned as is.

Overall, these functions provide a set of tools for manipulating and formatting data related to API requests, making it easier to construct and handle API calls in the larger project.
## Questions: 
 **Question 1:** What is the purpose of the `mergeRecords` function?

**Answer:** The `mergeRecords` function takes in multiple `FetchApiRecord` objects and merges them into a single `FetchApiRecord` object. It combines the values of duplicate keys and returns the final merged object.

**Question 2:** What is the purpose of the `mergeQueryStrings` function?

**Answer:** The `mergeQueryStrings` function takes in multiple `FetchApiRecord` objects or strings and merges them into a single query string. It converts `FetchApiRecord` objects to URLSearchParams and concatenates them with the strings, separating them with an ampersand (&).

**Question 3:** What is the purpose of the `formatHeaders` function?

**Answer:** The `formatHeaders` function takes in a `FetchApiRecord` object and converts it into a `Headers` object. It iterates over the key-value pairs of the `FetchApiRecord` and appends the values to the `Headers` object, handling arrays of values correctly.