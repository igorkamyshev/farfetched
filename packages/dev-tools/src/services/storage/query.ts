import { inspectGraph } from 'effector/inspect';
import { NodeMetaSumbol } from '@farfetched/core';

export function listenQueryCreation() {
  inspectGraph({
    fn: (declaration) => {
      if (NodeMetaSumbol in declaration.meta) {
        console.log('FF region!', declaration);
      }

      console.log('Declaration', declaration);
    },
  });
}
