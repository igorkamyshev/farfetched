import { NodeMetaSumbol } from '@farfetched/core';
import { Node } from 'effector';
import { type Declaration } from 'effector/inspect';

export type QueryMeta = { type: 'query'; id: string };

export type ConnectQueryMeta = {
  type: 'operator';
  operator: 'connectQuery';
  source: (Node & { meta: { [NodeMetaSumbol]: QueryMeta } })[];
  target: (Node & { meta: { [NodeMetaSumbol]: QueryMeta } })[];
};

export type FarfetchedDeclaration<
  Meta extends { type: string } = { type: string }
> = Declaration & {
  meta: {
    [NodeMetaSumbol]: Meta;
  };
};

export function isFarfetchedDeclaration(
  declaration: Declaration
): declaration is FarfetchedDeclaration {
  return NodeMetaSumbol in declaration.meta;
}

export function isQueryDeclaration(
  declaration: FarfetchedDeclaration
): declaration is FarfetchedDeclaration<QueryMeta> {
  return declaration.meta[NodeMetaSumbol].type === 'query';
}

export function isConnectQueryDeclaration(
  declaration: FarfetchedDeclaration
): declaration is FarfetchedDeclaration<ConnectQueryMeta> {
  return (
    declaration.meta[NodeMetaSumbol].type === 'operator' &&
    (declaration.meta[NodeMetaSumbol] as any).operator === 'connectQuery'
  );
}
