import { NodeMetaSumbol } from '@farfetched/core';
import { type Declaration } from 'effector/inspect';
import { Node } from 'effector';

export type QueryMeta = { type: 'query' };

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
): declaration is FarfetchedDeclaration<{
  type: 'operator';
  operator: 'connectQuery';
  source: (Node & { meta: { [NodeMetaSumbol]: QueryMeta } })[];
  target: (Node & { meta: { [NodeMetaSumbol]: QueryMeta } })[];
}> {
  return (
    declaration.meta[NodeMetaSumbol].type === 'operator' &&
    (declaration.meta[NodeMetaSumbol] as any).operator === 'connectQuery'
  );
}

export function isRetryDeclaration(
  declaration: FarfetchedDeclaration
): declaration is FarfetchedDeclaration<{
  type: 'operator';
  operator: 'retry';
  target: Node & { meta: { [NodeMetaSumbol]: QueryMeta } };
}> {
  return (
    declaration.meta[NodeMetaSumbol].type === 'operator' &&
    (declaration.meta[NodeMetaSumbol] as any).operator === 'retry'
  );
}

export function isCacheDeclaration(
  declaration: FarfetchedDeclaration
): declaration is FarfetchedDeclaration<{
  type: 'operator';
  operator: 'cache';
  adapter?: string;
  target: Node & { meta: { [NodeMetaSumbol]: QueryMeta } };
}> {
  return (
    declaration.meta[NodeMetaSumbol].type === 'operator' &&
    (declaration.meta[NodeMetaSumbol] as any).operator === 'cache'
  );
}

export function isInfoDeclaration(
  declaration: FarfetchedDeclaration
): declaration is FarfetchedDeclaration<{ name: string; type: 'info' }> {
  return (
    declaration.meta[NodeMetaSumbol].type === 'info' &&
    'name' in declaration.meta[NodeMetaSumbol]
  );
}

export function childDeclaration(parent: FarfetchedDeclaration) {
  return function (declaration: FarfetchedDeclaration) {
    return (declaration.region as any)?.id === parent.id;
  };
}

export function inRegion({
  regionId,
  kind,
}: {
  regionId: string;
  kind: string;
}) {
  return function (declaration: Declaration) {
    return (
      declaration.kind === kind && (declaration.region as any)?.id === regionId
    );
  };
}
