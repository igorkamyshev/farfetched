import { render } from 'solid-js/web';
import { initDevTools } from '@farfetched/dev-tools';

import { App } from './app';
import { domain } from './shared/domain';

render(() => <App />, document.getElementById('root') as HTMLElement);

initDevTools({ domain });
