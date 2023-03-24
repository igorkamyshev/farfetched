import { NodeMetaSumbol } from '@farfetched/core';
import { combine, createStore } from 'effector';
import { type Declaration } from 'effector/inspect';

import { appStarted } from '../viewer';
import { declarations } from './collect';
import {
  isFarfetchedDeclaration,
  isConnectQueryDeclaration,
  isQueryDeclaration,
  isRetryDeclaration,
  childDeclaration,
  isInfoDeclaration,
  inRegion,
  isCacheDeclaration,
} from './guards';

// -- Declarations

export const $all = createStore<Declaration[]>([]).on(
  appStarted,
  () => declarations
);

const $declarations = $all.map((declarations) =>
  declarations.filter(isFarfetchedDeclaration)
);

// -- Query

export const $queries = combine(
  { declarations: $declarations, all: $all },
  ({ declarations, all }) =>
    declarations.filter(isQueryDeclaration).map((declaration) => ({
      id: declaration.id,
      name: (declaration.region?.meta['name'] ?? 'Unknown Query') as string,
      info: declarations
        .filter(childDeclaration(declaration))
        .filter(isInfoDeclaration)
        .map((info) => ({
          name: info.meta[NodeMetaSumbol].name,
          storeId: all
            .filter(inRegion({ regionId: info.id, kind: 'store' }))
            .map(({ meta }) => meta['unitId'] as string)[0],
        })),
    }))
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

// -- retry

export const $retries = combine(
  { declarations: $declarations, all: $all },
  ({ declarations, all }) =>
    declarations.filter(isRetryDeclaration).map((declaration) => ({
      id: declaration.id,
      targetId: declaration.meta[NodeMetaSumbol].target.id,
      info: declarations
        .filter(childDeclaration(declaration))
        .filter(isInfoDeclaration)
        .map((info) => ({
          name: info.meta[NodeMetaSumbol].name,
          storeId: all
            .filter(inRegion({ regionId: info.id, kind: 'store' }))
            .map(({ meta }) => meta['unitId'] as string)[0],
        })),
    }))
);

// -- cache

export const $caches = combine(
  { declarations: $declarations, all: $all },
  ({ declarations, all }) =>
    declarations.filter(isCacheDeclaration).map((declaration) => ({
      id: declaration.id,
      targetId: declaration.meta[NodeMetaSumbol].target.id,
      info: {
        adapter: declaration.meta[NodeMetaSumbol].adapter ?? 'Unkown Cache',
      },
    }))
);

// -- For tracking
export const $usedStoreIds = combine(
  { retries: $retries, queries: $queries },
  ({ retries, queries }) => [
    ...retries.flatMap((retry) => retry.info.flatMap((info) => info.storeId)),
    ...queries.flatMap((query) => query.info.flatMap((info) => info.storeId)),
  ]
);
