import { reflect } from '@effector/reflect';

import { $cacheInfo } from '../operation_info.view-model';

interface Info {
  id: string;
  info: { adapter: string };
}

function CacheInfoView({ info }: { info: Array<Info> }) {
  if (info.length === 0) {
    return null;
  }

  return (
    <div>
      <p>Caches</p>
      <ol>
        {info.map((cache) => (
          <li key={cache.id}>
            <ul>{cache.info.adapter}</ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const CacheInfo = reflect({
  view: CacheInfoView,
  bind: { info: $cacheInfo },
});
