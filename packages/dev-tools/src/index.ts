import { Domain, Scope } from 'effector';
import { using } from 'forest';
import { App } from './app';

function initDevTools({ domain, scope }: { domain?: Domain; scope?: Scope }) {
  const container = document.createElement('div');

  (document.body ?? document.documentElement).appendChild(container);

  using(container, () => {
    App({ domain });
  });
}

export { initDevTools };
