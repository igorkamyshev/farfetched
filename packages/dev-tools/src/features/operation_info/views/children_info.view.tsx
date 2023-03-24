import { reflect } from '@effector/reflect';
import { List, Button } from 'antd';
import { AimOutlined } from '@ant-design/icons';

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
    <List header="children">
      {children.map((query) => (
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

export const ChildrenInfo = reflect({
  view: ChildrenInfoView,
  bind: { children: $dependantQueries, onClick: selectDeclaration },
});
