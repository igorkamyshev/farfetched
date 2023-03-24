import { inspectGraph, type Declaration } from 'effector/inspect';

export const declarations: Declaration[] = [];

inspectGraph({
  fn: (declaration) => {
    declarations.push(declaration);
  },
});
