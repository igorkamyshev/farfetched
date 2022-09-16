/* eslint-disable */
export default {
  displayName: 'solid',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/solid',
  // Because of Solid 🤷‍♂️
  // https://dev.to/lexlohr/testing-your-solidjs-code-2gfh
  moduleNameMapper: {
    'solid-js/web': 'node_modules/solid-js/web/dist/web.cjs',
    'solid-js': 'node_modules/solid-js/dist/solid.cjs',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
