import { useState } from 'react';
import { useStore } from 'effector-react';
import { Layout, InputNumber, Button, List, Avatar, PageHeader } from 'antd';

import { pokemonsQuery } from './pokemon';
import styles from './app.module.css';

export function App() {
  const pokemons = useStore(pokemonsQuery.$data);
  const loading = useStore(pokemonsQuery.$pending);

  const [limit, setLimit] = useState(10);

  return (
    <Layout className={styles['layout']}>
      <PageHeader title="Pokemon list">
        <InputNumber
          min={1}
          value={limit}
          onChange={setLimit}
          addonBefore="Limit"
        />
        <Button
          onClick={() => pokemonsQuery.start({ limit })}
          type="primary"
          className={styles['loadButton']}
        >
          Load pokemons
        </Button>
      </PageHeader>
      {pokemons && (
        <Layout.Content className={styles['content']}>
          <List
            loading={loading}
            dataSource={pokemons}
            renderItem={(pokemon) => (
              <List.Item className={styles['item']}>
                <List.Item.Meta
                  avatar={<Avatar src={pokemon.image} />}
                  // description={pokemon.url}
                  title={pokemon.name}
                />
              </List.Item>
            )}
            rowKey={(pokemon) => pokemon.url}
            className={styles['list']}
            size="small"
            bordered
          />
        </Layout.Content>
      )}
    </Layout>
  );
}

export default App;
