import { reflect } from '@effector/reflect';

import {
  $dependOnQueries,
  selectDeclaration,
} from '../operation_info.view-model';

function ParentsInfoView({
  parents,
  onClick,
}: {
  parents: Array<{ id: string; name: string }>;
  onClick: (id: string) => void;
}) {
  if (parents.length === 0) {
    return null;
  }

  return (
    <div>
      <p>Parends</p>
      <ul>
        {parents.map((query) => (
          <li key={query.id}>
            <button onClick={() => onClick(query.id)}>{query.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const ParentsInfo = reflect({
  view: ParentsInfoView,
  bind: { parents: $dependOnQueries, onClick: selectDeclaration },
});
