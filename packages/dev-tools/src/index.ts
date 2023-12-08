import type { Scope } from 'effector';
import { createApp } from 'vue';

// @ts-expect-error
import App from './App.vue';
import { appStarted } from './model/init';

export function attachFarfetchedDevTools(config?: {
  scope?: Scope;
  element?: Element;
}) {
  let root: Element;
  if (config?.element) {
    root = config.element;
  } else {
    root = document.createElement('div');
    document.body.appendChild(root);
  }

  appStarted({ scope: config?.scope });

  createApp(App).mount(root);
}
