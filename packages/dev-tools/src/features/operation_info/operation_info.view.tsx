import { variant } from '@effector/reflect';
import { useUnit } from 'effector-react';

import {
  $activeQuery,
  $dependantQueries,
  $operationInfoIsOpen,
  $dependOnQueries,
  $retryInfo,
} from './operation_info.view-model';

function OperationInfoView() {
  const { activeQuery, dependantQueries, dependOnQueries, retryInfo } = useUnit(
    {
      activeQuery: $activeQuery,
      dependantQueries: $dependantQueries,
      dependOnQueries: $dependOnQueries,
      retryInfo: $retryInfo,
    }
  );

  return (
    <section
      style={{
        zIndex: 2,
        backgroundColor: 'white',
        position: 'absolute',
        top: '10px',
        left: '10px',
      }}
    >
      <p>{activeQuery?.name}</p>
      <div>
        <p>Dependant</p>
        <ul>
          {dependantQueries.map((query) => (
            <li key={query.id}>{query.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <p>Parends</p>
        <ul>
          {dependOnQueries.map((query) => (
            <li key={query.id}>{query.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <p>Retries</p>
        <ol>
          {retryInfo.map((retry) => (
            <li key={retry.id}>
              retry
              <ul>
                {retry.info.map((info, idx) => (
                  <li key={idx}>
                    {info.name}: {info.value}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export const OperationInfo = variant({
  if: $operationInfoIsOpen,
  then: OperationInfoView,
});
