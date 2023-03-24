import { NodeMetaSumbol } from '@farfetched/core';
import { type Declaration } from 'effector/inspect';
import { Node } from 'effector';

export type QueryMeta = { type: 'query' };

export type ConnectQueryMeta = {
  type: 'operator';
  operator: 'connectQuery';
  source: (Node & { meta: { [NodeMetaSumbol]: QueryMeta } })[];
  target: (Node & { meta: { [NodeMetaSumbol]: QueryMeta } })[];
};

export type RetryMeta = {
  type: 'operator';
  operator: 'retry';
  target: Node & { meta: { [NodeMetaSumbol]: QueryMeta } };
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

export function isRetryDeclaration(
  declaration: FarfetchedDeclaration
): declaration is FarfetchedDeclaration<RetryMeta> {
  return (
    declaration.meta[NodeMetaSumbol].type === 'operator' &&
    (declaration.meta[NodeMetaSumbol] as any).operator === 'retry'
  );
}
