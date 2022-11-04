import { Domain, sample, Scope } from 'effector';
import { render } from 'solid-js/web';

import { toInternalDomain, internalDomainSymbol } from '@farfetched/core';

import { Screen, openSequenceChanged } from './screen';
import { addQuery, queryApi } from './kernel';
import { Menu } from './menu';
import { appInited } from './viewer';
import { Canvas } from './canvas';

function DevToolsApp() {
  return (
    <Screen>
      <Menu />
      <Canvas />
    </Screen>
  );
}

export function initDevTools({
  domain,
  container,
  openSequence,
}: {
  domain: Domain;
  // TODO: handle scope properly
  scope?: Scope;
  container?: HTMLElement;
  openSequence?: string;
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
      startEvent: query.start,
      pending: query.$pending.getState(),
      enabled: query.$enabled.getState(),
    });

    sample({
      clock: query.$data,
      fn: (value) => ({ key: name, value }),
      target: queryApi.api.dataChanged,
    });

    sample({
      clock: query.start,
      fn: (value) => ({ key: name, value }),
      target: queryApi.api.paramsChanged,
    });

    sample({
      clock: query.$pending,
      fn: (value) => ({ key: name, value }),
      target: queryApi.api.pendingStateChanged,
    });

    // TODO: two-way binding
    sample({
      clock: query.$enabled,
      fn: (value) => ({ key: name, value }),
      target: queryApi.api.enabledStateChanged,
    });
  });

  render(() => <DevToolsApp />, renderTo);

  if (openSequence) {
    openSequenceChanged(openSequence);
  }

  appInited();
}
