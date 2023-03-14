import { NodeMetaSumbol } from '@farfetched/core';
import { createStore, sample } from 'effector';

import { appStarted } from '../viewer';
import { declarations } from './collect';
import { isConnectQueryDeclaration, isQueryDeclaration } from './guards';

// -- Query

type QueryReport = {
  id: string;
  name: string;
};

export const $queries = createStore<QueryReport[]>([]);

sample({
  clock: appStarted,
  fn: () =>
    declarations.filter(isQueryDeclaration).map((declaration) => ({
      id: declaration.meta[NodeMetaSumbol].id,
      name: (declaration.region?.meta.name ?? 'Unknown Query') as string,
    })),
  target: $queries,
});

// -- connectQuery

type QueryConnection = {
  id: string;
  fromId: string;
  toId: string;
};

export const $queryConnections = createStore<QueryConnection[]>([]);

sample({
  clock: appStarted,
  fn: () =>
    declarations.filter(isConnectQueryDeclaration).map((declaration) => ({
      // TODO: use id
      id: (declaration.region as any).sid!,
      // TODO: create connections for all sources
      fromId: declaration.meta[NodeMetaSumbol].source.map(
        (node) => node.meta[NodeMetaSumbol].id
      )[0],
      // TODO: create connections for all targets
      toId: declaration.meta[NodeMetaSumbol].target.map(
        (node) => node.meta[NodeMetaSumbol].id
      )[0],
    })),
  target: $queryConnections,
});
