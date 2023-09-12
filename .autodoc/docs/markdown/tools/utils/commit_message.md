[View code on GitHub](https://github.com/igorkamyshev/farfetched/tools/utils/commit_message.js)

The code provided is a module that exports two functions: `getAddMessage` and `getVersionMessage`. These functions are used to retrieve messages related to changesets and release versions in the larger project.

The `getAddMessage` function takes a `changeset` object as a parameter and returns the `summary` property of that object. This function is likely used to retrieve a message or summary of the changes made in a particular changeset. Here is an example usage of this function:

```javascript
const changeset = {
  summary: "Added new feature XYZ",
  // other properties...
};

const addMessage = getAddMessage(changeset);
console.log(addMessage); // Output: "Added new feature XYZ"
```

The `getVersionMessage` function takes a `releasePlan` object as a parameter. It filters the `releases` array within the `releasePlan` object to exclude any releases with a type of "none". It then retrieves the `newVersion` property of the first release in the filtered array. This function is likely used to retrieve a message or summary of the version being released. Here is an example usage of this function:

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

In the larger project, these functions can be used to retrieve relevant messages or summaries related to changesets and release versions. These messages can then be used for logging, displaying information to users, or any other purposes that require communicating information about changes and releases.
## Questions: 
 1. **Question:** What is the purpose of the `getAddMessage` function and what does it return?
   - **Answer:** The `getAddMessage` function takes a `changeset` parameter and returns the `summary` property of the `changeset` object.

2. **Question:** What is the purpose of the `getVersionMessage` function and what does it return?
   - **Answer:** The `getVersionMessage` function takes a `releasePlan` parameter and returns a string that includes the `newVersion` property of the first release in the `releases` array of the `releasePlan` object.

3. **Question:** What is the purpose of the filter in the `getVersionMessage` function and what does it filter out?
   - **Answer:** The filter in the `getVersionMessage` function filters out any releases with a `type` property equal to 'none'.