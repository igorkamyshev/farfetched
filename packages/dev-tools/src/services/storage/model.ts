import { NodeMetaSumbol } from '@farfetched/core';
import { createStore, sample } from 'effector';

import { appStarted } from '../viewer';
import { declarations } from './collect';
import {
  FarfetchedDeclaration,
  isConnectQueryDeclaration,
  isQueryDeclaration,
} from './guards';

// -- Declarations

const $declarations = createStore<FarfetchedDeclaration[]>([]);

sample({
  clock: appStarted,
  fn: () => declarations,
  target: $declarations,
});

// -- Query

type QueryReport = {
  id: string;
  name: string;
};

export const $queries = $declarations.map((declarations) =>
  declarations.filter(isQueryDeclaration).map(
    (declaration): QueryReport => ({
      id: declaration.id,
      name: (declaration.region?.meta['name'] ?? 'Unknown Query') as string,
    })
  )
);

// -- connectQuery

type QueryConnection = {
  id: string;
  fromId: string;
  toId: string;
};

export const $queryConnections = $declarations.map((declarations) =>
  declarations.filter(isConnectQueryDeclaration).flatMap((declaration) =>
    declaration.meta[NodeMetaSumbol].target.flatMap((target) =>
      declaration.meta[NodeMetaSumbol].source.flatMap(
        (source): QueryConnection => ({
          id: `${declaration.id}-${target.id}-${source.id}`,
          fromId: source.id,
          toId: target.id,
        })
      )
    )
  )
);
