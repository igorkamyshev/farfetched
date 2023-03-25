import { Input } from 'antd';
import { reflect } from '@effector/reflect';
import { SearchOutlined } from '@ant-design/icons';

import { $value, handleChange } from './search.view-model';

export const Search = reflect({
  view: Input,
  bind: {
    placeholder: 'operation name',
    addonBefore: <SearchOutlined />,
    value: $value,
    onChange: handleChange.prepend((e) => e.target.value),
  },
});
