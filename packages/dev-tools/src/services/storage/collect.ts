import { inspectGraph } from 'effector/inspect';

import { type FarfetchedDeclaration, isFarfetchedDeclaration } from './guards';

export const declarations: FarfetchedDeclaration[] = [];

inspectGraph({
  fn: (declaration) => {
    if (isFarfetchedDeclaration(declaration)) {
      declarations.push(declaration);
    }
  },
});
