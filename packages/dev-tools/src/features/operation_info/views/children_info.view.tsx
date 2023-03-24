import { reflect } from '@effector/reflect';

import {
  $dependantQueries,
  selectDeclaration,
} from '../operation_info.view-model';

function ChildrenInfoView({
  children,
  onClick,
}: {
  children: Array<{ id: string; name: string }>;
  onClick: (id: string) => void;
}) {
  if (children.length === 0) {
    return null;
  }

  return (
    <div>
      <p>Children</p>
      <ul>
        {children.map((query) => (
          <li key={query.id}>
            <button onClick={() => onClick(query.id)}>{query.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const ChildrenInfo = reflect({
  view: ChildrenInfoView,
  bind: { children: $dependantQueries, onClick: selectDeclaration },
});
