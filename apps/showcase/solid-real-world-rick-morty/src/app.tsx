import { RouterProvider, Route } from 'atomic-router-solid';
import { createHistoryRouter } from 'atomic-router';
import { createBrowserHistory } from 'history';

import { mainRoute, MainPage } from './pages/main';
import { characterRoute, CharacterPage } from './pages/character';
import { LocationPage, locationRoute } from './pages/location';

const router = createHistoryRouter({
  routes: [
    { path: '/', route: mainRoute },
    { path: '/:page', route: mainRoute },
    { path: '/character/:characterId', route: characterRoute },
    { path: '/location/:locationId', route: locationRoute },
  ],
});

const history = createBrowserHistory();
router.setHistory(history);

function App() {
  return (
    <RouterProvider router={router}>
      <Route route={mainRoute} view={MainPage} />
      <Route route={characterRoute} view={CharacterPage} />
      <Route route={locationRoute} view={LocationPage} />
    </RouterProvider>
  );
}

export { App };
