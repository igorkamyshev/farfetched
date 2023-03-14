import { allSettled, fork, type Scope } from 'effector';
import { Provider } from 'effector-react';
import { createRoot } from 'react-dom/client';

import { appStarted } from './services/viewer';
import { App } from './app';
import { listenFarfetchedPrimitives } from './services/storage';

listenFarfetchedPrimitives();

export function attachDevTools(config: { scope: Scope }) {
  const scope = fork();

  const container = document.createElement('div');
  document.body.appendChild(container);

  allSettled(appStarted, { scope });

  createRoot(container).render(
    <Provider value={scope}>
      <App />
    </Provider>
  );
}
