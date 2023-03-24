import { NodeMetaSumbol } from '@farfetched/core';
import { combine, createStore, sample } from 'effector';
import { type Declaration } from 'effector/inspect';

import { appStarted } from '../viewer';
import { declarations } from './collect';
import {
  isFarfetchedDeclaration,
  isConnectQueryDeclaration,
  isQueryDeclaration,
  isRetryDeclaration,
} from './guards';

// -- Declarations

export const $all = createStore<Declaration[]>([]);
const $declarations = $all.map((declarations) =>
  declarations.filter(isFarfetchedDeclaration)
);

sample({
  clock: appStarted,
  fn: () => declarations,
  target: $all,
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

// -- retry

export const $retries = combine(
  { declarations: $declarations, all: $all },
  ({ declarations, all }) =>
    declarations.filter(isRetryDeclaration).map((declaration) => ({
      id: declaration.id,
      targetId: declaration.meta[NodeMetaSumbol].target.id,
      info: declarations
        .filter((d) => d.region?.id === declaration.id)
        .map((info) => ({
          name: info.meta[NodeMetaSumbol].name,
          storeId: all
            .filter((i) => i.kind === 'store')
            .filter((i) => i.region?.id === info.id)
            .map((i) => i.meta['unitId'])
            .at(0),
        })),
    }))
);

// -- For tracking
export const $usedStoreIds = combine({ retries: $retries }, ({ retries }) =>
  retries.flatMap((retry) => retry.info.flatMap((info): string => info.storeId))
);
