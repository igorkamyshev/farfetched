import { combine, createEvent, createStore, sample } from 'effector';
import { type Declaration, inspectGraph } from 'effector/inspect';
import { NodeMetaSumbol } from '@farfetched/core';

const $declarations = createStore<Declaration[]>([], { serialize: 'ignore' });

const newDeclaration = createEvent<Declaration>();

sample({
  clock: newDeclaration,
  source: $declarations,
  fn: (oldDeclarations, newDeclaration) => [...oldDeclarations, newDeclaration],
  target: $declarations,
});

inspectGraph({
  fn: (decl) => {
    newDeclaration(decl);
  },
});

export const $operations = combine($declarations, (declarations) =>
  declarations.filter(isFarfetchedDeclaration)
);

// utils

function isFarfetchedDeclaration(
  declaration: Declaration
): declaration is FarfetchedDeclaration {
  return NodeMetaSumbol in declaration.meta;
}

export function getFarfetchedMeta(declaration: FarfetchedDeclaration) {
  return declaration.meta[NodeMetaSumbol];
}

type FarfetchedDeclaration<
  Meta extends { type: string } = { type: string; name?: string }
> = Declaration & {
  meta: {
    [NodeMetaSumbol]: Meta;
  };
};
