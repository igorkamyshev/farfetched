import { reflect } from '@effector/reflect';

import { $retryInfo } from '../operation_info.view-model';

interface Info {
  info: {
    name: string;
    value: unknown;
  }[];
  id: string;
  targetId: string;
}

function RetryInfoView({ info }: { info: Array<Info> }) {
  if (info.length === 0) {
    return null;
  }

  return (
    <div>
      <p>Retries</p>
      <ol>
        {info.map((retry) => (
          <li key={retry.id}>
            <ul>
              {retry.info.map((info, idx) => (
                <li key={info.name}>
                  {info.name}: {info.value}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const RetryInfo = reflect({
  view: RetryInfoView,
  bind: { info: $retryInfo },
});
