import { allSettled, fork, Scope } from 'effector';
import { Provider } from 'effector-react';
import { createRoot } from 'react-dom/client';

import { appStarted } from './services/viewer';
import { App } from './app';
import './services/storage';
import { startInspection } from './services/tracker';

export function attachDevTools({ scope: outerScope }: { scope?: Scope }) {
  const innerScope = fork();

  startInspection({ outerScope, innerScope });

  const container = document.createElement('div');
  document.body.appendChild(container);

  allSettled(appStarted, { scope: innerScope });

  createRoot(container).render(
    <Provider value={innerScope}>
      <App />
    </Provider>
  );
}
