import { list } from '@effector/reflect';
import { List as AList, Button } from 'antd';

import { $foundQueries } from '../../services/filters';
import { selectDeclaration } from '../operation_info';

export function List() {
  return (
    <AList>
      <Content />
    </AList>
  );
}

const Content = list({
  source: $foundQueries,
  getKey: (item) => item.id,
  bind: {
    onClick: selectDeclaration,
  },
  view: ({
    name,
    onClick,
    id,
  }: {
    name: string;
    id: string;
    onClick: (id: string) => void;
  }) => (
    <AList.Item
      actions={[
        <Button key="more" type="link" onClick={() => onClick(id)}>
          more
        </Button>,
      ]}
    >
      {name}
    </AList.Item>
  ),
});
