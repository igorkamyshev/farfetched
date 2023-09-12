[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/tools/utils)

The `commit_message.js` file in the `.autodoc/docs/json/tools/utils` directory of the project contains two functions: `getAddMessage` and `getVersionMessage`. These functions are used to retrieve messages related to changesets and release versions respectively.

The `getAddMessage` function accepts a `changeset` object as an argument and returns the `summary` property of that object. This function is typically used to fetch a summary or message of the changes made in a specific changeset. Here's an example of how this function might be used:

```javascript
const changeset = {
  summary: "Added new feature XYZ",
  // other properties...
};

const addMessage = getAddMessage(changeset);
console.log(addMessage); // Output: "Added new feature XYZ"
```

The `getVersionMessage` function, on the other hand, accepts a `releasePlan` object as an argument. It filters the `releases` array within the `releasePlan` object to exclude any releases with a type of "none". It then retrieves the `newVersion` property of the first release in the filtered array. This function is typically used to fetch a summary or message of the version being released. Here's an example of how this function might be used:

```javascript
const releasePlan = {
  releases: [
    { type: "none", newVersion: "1.0.0" },
    { type: "major", newVersion: "2.0.0" },
    { type: "minor", newVersion: "2.1.0" },
  ],
  // other properties...
};

const versionMessage = getVersionMessage(releasePlan);
console.log(versionMessage); // Output: "Release 2.0.0"
```

In the context of the larger project, these functions can be used to fetch relevant messages or summaries related to changesets and release versions. These messages can then be used for logging, displaying information to users, or any other purposes that require communicating information about changes and releases.
