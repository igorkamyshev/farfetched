import {
  allSettled,
  fork,
  sample,
  type Scope,
  type Event,
  type Subscription,
} from 'effector';
import { Provider } from 'effector-react';
import { createRoot } from 'react-dom/client';

import './services/storage';
import { appStarted } from './services/viewer';
import { App } from './app';
import { startInspection } from './services/tracker';
import { $openSequence, show } from './services/visibility';

export function attachDevTools({
  scope: userLandScope,
  openSequence,
  open,
}: {
  scope?: Scope;
  openSequence?: string;
  open?: Event<unknown>;
}): Subscription {
  // -- Logic start
  const devToolsScope = fork();

  if (open) {
    sample({ clock: open, target: show });
  }

  if (openSequence) {
    allSettled($openSequence, { scope: devToolsScope, params: openSequence });
  }

  const stopInspection = startInspection({ userLandScope, devToolsScope });

  allSettled(appStarted, { scope: devToolsScope });

  // -- UI start
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <Provider value={devToolsScope}>
      <App />
    </Provider>
  );

  // -- Finalization
  const destory = () => {
    stopInspection();
    root.unmount();
    document.removeChild(container);
  };
  destory.unsubscribe = destory;

  return destory;
}
