[View code on GitHub](https://github.com/igorkamyshev/farfetched/tools/scripts/changelog/cli.mjs)

The code provided is a part of the `farfetched` project and is responsible for generating changelog files for different releases of the project. 

The code starts by importing necessary modules and functions from external libraries. It imports the `glob` module to search for files, the `readFile` and `writeFile` functions from the `fs/promises` module to read and write files, the `promisify` function from the `util` module to convert callback-based functions to promise-based functions, the `markdown` module to convert markdown to HTML, the `prettier` module to format the generated HTML, the `node-html-markdown` module to translate HTML to markdown, and the `semver-parser` module to parse and compare semantic versions. It also imports the `resolve` function from the `path` module and the `groupByVersions` function from a local `lib.mjs` file.

The code then uses the `glob` module to find all the `CHANGELOG.md` files in the `packages` and `deleted_packages` directories. It reads the content of each file, parses it using the `parseChangelog` function, and stores the parsed changelogs in an array.

Next, the code merges the parsed changelogs using the `mergeChangelogs` function. It creates a set of all the releases mentioned in the changelogs and initializes an empty map to store the merged changelogs. It iterates over each release, filters the related changes from the parsed changelogs, and groups them by version using the `groupByVersions` function. It then sorts the grouped changes in descending order of version using the `compareSemVer` function. For each version, it creates a log entry and adds the changes for each package. Finally, it adds the log entry to the map with the release as the key.

After merging the changelogs, the code iterates over each release and changelog entry in the merged changelogs. It renders the changelog using the `renderChangelog` function, replaces dots in the release version with hyphens to create a file name, resolves the file path, and writes the rendered changelog to the file.

The `renderChangelog` function takes a tree-like structure representing the changelog, converts it to HTML using the `markdown` module, translates the HTML to markdown using the `node-html-markdown` module, formats the markdown using the `prettier` module, and makes links on commit hashes using the `makeLinksOnCommits` function.

The `parseChangelog` function takes a markdown string representing a changelog, parses it using the `markdown` module, extracts the name of the package from the header, groups the content by version and changes using the `groupByLevel` function, and returns an object containing the name and changes.

The `groupByLevel` function groups the data based on the specified target level. It iterates over the data, checks the level of each item, and creates a new group when the level matches the target level.

The `getRelease` function takes a version string, parses it using the `semver-parser` module, and returns a string representing the release version (e.g., "1.0" for "1.0.0").

The `makeLinksOnCommits` function takes a content string, searches for commit hashes in the content, and replaces them with links to the corresponding commits on GitHub.

Overall, this code is responsible for finding and parsing changelog files, merging the parsed changelogs, rendering the merged changelogs, and writing the rendered changelogs to files. It provides a way to generate release-specific changelog files for the `farfetched` project.
## Questions: 
 **Question 1:** What is the purpose of the `groupByVersions` function and how is it used in the code?

**Answer:** The `groupByVersions` function is used to group related changes by their version number. It takes an array of packages as input and returns an array of objects, where each object represents a version and contains the packages with changes for that version. It is used in the `mergeChangelogs` function to group changes by version.

**Question 2:** What is the purpose of the `parseChangelog` function and how is it used in the code?

**Answer:** The `parseChangelog` function is used to parse the content of a changelog file. It takes a markdown string as input and returns an object representing the parsed changelog. The object contains the name of the package and the changes grouped by version. It is used in the `changelogs` array map function to parse each changelog file.

**Question 3:** What is the purpose of the `makeLinksOnCommits` function and how is it used in the code?

**Answer:** The `makeLinksOnCommits` function is used to replace commit hashes in the changelog content with links to the corresponding commits on GitHub. It takes the rendered changelog content as input and returns the modified content with commit hashes replaced by links. It is used in the `renderChangelog` function to add links to the rendered changelog.