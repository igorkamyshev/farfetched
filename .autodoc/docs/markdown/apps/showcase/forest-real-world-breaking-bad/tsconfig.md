[View code on GitHub](https://github.com/igorkamyshev/farfetched/apps/showcase/forest-real-world-breaking-bad/tsconfig.json)

The code provided is a configuration file written in JSON format. It is used to configure the TypeScript compiler for the farfetched project. The file is located in the `farfetched` directory.

The configuration file specifies various compiler options that determine how TypeScript code is compiled into JavaScript. Let's go through some of the key options:

- `"extends": "../../../tsconfig.base.json"`: This option extends the configuration from a base `tsconfig.base.json` file located three directories above the current directory. This allows the project to inherit common compiler options from the base configuration.

- `"compilerOptions"`: This section contains a set of options that customize the behavior of the TypeScript compiler. Some notable options include:
  - `"target": "ESNext"`: This option sets the target ECMAScript version to ESNext, which represents the latest version of ECMAScript.
  - `"module": "ESNext"`: This option specifies the module system to be used. In this case, it is set to ESNext, which supports the latest module syntax.
  - `"strict": true`: This option enables strict type-checking and stricter compiler settings to catch potential errors.
  - `"resolveJsonModule": true`: This option allows importing JSON files as modules, which can be useful for working with JSON data in the project.
  - `"lib": ["DOM", "DOM.Iterable", "ESNext"]`: This option specifies the libraries that are available to the project. In this case, it includes the DOM and DOM.Iterable libraries, as well as ESNext.

- `"include": ["**/*.js", "**/*.ts", "src"]`: This option specifies the files and directories that should be included in the compilation process. It includes all JavaScript and TypeScript files in the project, as well as the `src` directory.

Overall, this configuration file ensures that the TypeScript compiler is set up with the appropriate options for the farfetched project. It sets the target ECMAScript version, module system, strict type-checking, and includes the necessary libraries. By using this configuration file, developers can compile their TypeScript code into JavaScript that is compatible with the project's requirements.
## Questions: 
 1. **What is the purpose of the `extends` property in the `tsconfig.json` file?**
The `extends` property is used to inherit compiler options from a base configuration file (`tsconfig.base.json` in this case), allowing for easier management and reuse of common configuration settings.

2. **Why is the `noEmit` property set to `true`?**
The `noEmit` property is set to `true` to prevent the TypeScript compiler from generating any output files (e.g., JavaScript files). This is useful when the code is being transpiled and bundled by a separate build tool or when the code is being used in a development environment where the output files are not needed.

3. **What is the purpose of the `include` property and its glob patterns?**
The `include` property specifies which files should be included in the compilation process. The glob patterns (`**/*.js`, `**/*.ts`, `src`) indicate that all JavaScript and TypeScript files in the project's directory structure should be included, as well as any files in the `src` directory.