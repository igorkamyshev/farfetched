import { Domain, sample, Scope } from 'effector';
import { render } from 'solid-js/web';

import { toInternalDomain, internalDomainSymbol } from '@farfetched/core';

import { Screen } from './screen';
import { addQuery } from './kernel';
import { Menu } from './menu';
import { queryDataChanged } from './kernel/main';

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
    const name = query.__.meta.name;
    
    addQuery({
      name,
      data: query.$data.getState(),
      currentParams: null,
    });

    sample({
      clock: query.$data,
      fn: (value) => ({ key: name, value }),
      target: queryDataChanged,
    });
  });

  render(() => <DevToolsApp />, renderTo);
}
