import { RouterProvider, Route } from 'atomic-router-solid';
import { createHistoryRouter } from 'atomic-router';
import { createBrowserHistory } from 'history';

import { MainPage } from './pages/main';
import { CharacterPage } from './pages/character';
import { LocationPage } from './pages/location';
import { EpisodePage } from './pages/episode';

import { Menu } from './features/layout';

import { characterRoute, characterListRoute } from './entities/character';
import { locationRoute } from './entities/location';
import { episodeRoute, episodeListRoute } from './entities/episode';
import { EpisodesListPage } from './pages/episodes_list';

const router = createHistoryRouter({
  routes: [
    { path: '/', route: characterListRoute },
    { path: '/characters/:page', route: characterListRoute },
    { path: '/character/:characterId', route: characterRoute },
    { path: '/location/:locationId', route: locationRoute },
    { path: '/episodes', route: episodeListRoute },
    { path: '/episodes/:page', route: episodeListRoute },
    { path: '/episode/:episodeId', route: episodeRoute },
  ],
});

const history = createBrowserHistory();
// @ts-expect-error will be fixes after new router
router.setHistory(history);

function App() {
  return (
    <RouterProvider router={router}>
      <Menu />
      <Route route={characterListRoute} view={MainPage} />
      <Route route={characterRoute} view={CharacterPage} />
      <Route route={locationRoute} view={LocationPage} />
      <Route route={episodeListRoute} view={EpisodesListPage} />
      <Route route={episodeRoute} view={EpisodePage} />
    </RouterProvider>
  );
}

export { App };
