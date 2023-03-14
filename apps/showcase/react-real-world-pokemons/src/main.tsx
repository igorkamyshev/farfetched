import { attachDevTools } from '@farfetched/dev-tools';
import { createRoot } from 'react-dom/client';
import { Provider } from 'effector-react';
import { fork } from 'effector';

import { App } from './app';

const scope = fork();

attachDevTools({ scope });

createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider value={scope}>
    <App />
  </Provider>
);
