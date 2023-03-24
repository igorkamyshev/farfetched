import { reflect } from '@effector/reflect';
import { List, Button } from 'antd';
import { AimOutlined } from '@ant-design/icons';

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
    <List header="Parents">
      {parents.map((query) => (
        <List.Item
          key={query.id}
          actions={[
            <Button type="ghost" onClick={() => onClick(query.id)}>
              <AimOutlined />
            </Button>,
          ]}
        >
          {query.name}
        </List.Item>
      ))}
    </List>
  );
}

export const ParentsInfo = reflect({
  view: ParentsInfoView,
  bind: { parents: $dependOnQueries, onClick: selectDeclaration },
});
