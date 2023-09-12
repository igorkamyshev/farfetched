[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/tools)

The `tsconfig.tools.json` file in the `.autodoc/docs/json/tools` directory is a configuration file for the TypeScript compiler. It extends the base configuration file `tsconfig.base.json` and specifies additional compiler options. For instance, it sets the output directory for the compiled JavaScript files to `../dist/out-tsc/tools`, and the root directory of the TypeScript files to the current directory. It also sets the module system to `commonjs`, targets ECMAScript 5, and includes the `node` type declaration file. All TypeScript files in the project with a `.ts` extension are included in the compilation.

Here's an example of how the TypeScript compiler might use this configuration:

```javascript
// TypeScript code
import * as fs from 'fs';
let data = fs.readFileSync('file.txt', 'utf8');
console.log(data);

// Compiled JavaScript code (using the settings in tsconfig.tools.json)
var fs = require('fs');
var data = fs.readFileSync('file.txt', 'utf8');
console.log(data);
```

In the `utils` subfolder, the `commit_message.js` file contains two functions: `getAddMessage` and `getVersionMessage`. `getAddMessage` retrieves the `summary` property of a `changeset` object, while `getVersionMessage` filters the `releases` array within a `releasePlan` object to exclude releases with a type of "none", and retrieves the `newVersion` property of the first release in the filtered array.

These functions can be used to fetch messages related to changesets and release versions. For example:

```javascript
const changeset = { summary: "Added new feature XYZ" };
console.log(getAddMessage(changeset)); // Output: "Added new feature XYZ"

const releasePlan = {
  releases: [
    { type: "none", newVersion: "1.0.0" },
    { type: "major", newVersion: "2.0.0" },
    { type: "minor", newVersion: "2.1.0" },
  ],
};
console.log(getVersionMessage(releasePlan)); // Output: "Release 2.0.0"
```

These messages can be used for logging, displaying information to users, or other purposes that require communicating information about changes and releases.
