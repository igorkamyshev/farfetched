[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/apps)

The `.autodoc/docs/json/apps` directory contains configuration and source code files for the `farfetched` project. The `showcase` subfolder houses the main configuration files and source code for the `farfetched` project, a web application built with React and TypeScript. The `index.html` file serves as the entry point for the web application, while the `project.json`, `tsconfig.json`, and `vite.config.ts` files define various targets and options for building, serving, linting, and previewing the project. The `src` subfolder contains the source code for the application, including the `app.tsx` file that sets up the routing functionality using the react-router-dom library.

```jsx
// Example of routing functionality in app.tsx
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
...
```

The `website` subfolder contains the `project.json` file, a configuration file for the "website" application in the "farfetched" project. It defines the build and serve targets for the application, as well as a target for preparing the changelog. The `"build"` and `"serve"` targets depend on the `"prepare_changelog"` target, ensuring that the changelog is prepared before the application is built or served.

```json
// Example of targets in project.json
"targets": {
  "build": {
    "executor": "nx:run-commands",
    "options": {
      "commands": ["vitepress build apps/website/docs"],
      "dependsOn": [{"target": "prepare_changelog"}]
    }
  },
  ...
}
```

These files and folders are integral to the development, build, and serve process of the `farfetched` project. They define the structure of the project, specify the compiler options and settings, configure the build tool, and set up the routing functionality for the application.
