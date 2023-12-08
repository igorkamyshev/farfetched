import type { Scope } from 'effector';
import { createApp } from 'vue';

// @ts-expect-error
import App from './App.vue';

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

  createApp(App).mount(root);
}
