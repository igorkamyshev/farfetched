import { Domain, Scope } from 'effector';
import { render } from 'solid-js/web';

import { toInternalDomain, internalDomainSymbol } from '@farfetched/core';

import { Screen } from './screen';
import { addQuery } from './kernel';
import { Menu } from './menu';

function DevToolsApp() {
  return (
    <Screen>
      <Menu />
      <p>...</p>
    </Screen>
  );
}

export function initDevTools({
  domain,
  container,
}: {
  domain: Domain;
  // TODO: handle scope properly
  scope?: Scope;
  container?: HTMLElement;
}) {
  let renderTo = container;
  if (!renderTo) {
    const newContainer = document.createElement('div');
    document.documentElement.appendChild(newContainer);
    renderTo = newContainer;
  }

  const internalDomain = toInternalDomain(domain)[internalDomainSymbol];

  internalDomain.onQueryCreated((query) => {
    addQuery({
      name: Math.random().toString(),
      data: query.$data.getState(),
    });
  });

  render(() => <DevToolsApp />, renderTo);
}
