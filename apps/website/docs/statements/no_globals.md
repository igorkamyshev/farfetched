# No globals

Farfetched **has no globals**. It means that you can be sure that your code will not be affected by any other code implicitly. All bulk operations **have to be done explicitly**.

This approach can be a bit new for users who are used to use `axios` or other libraries that have a global hooks or interceptors. To make it easier to understand, please refer to the following article: [Base URL for all operations](/recipes/base_url.md).
