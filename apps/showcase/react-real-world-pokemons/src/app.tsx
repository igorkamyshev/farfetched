import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import { Menu } from './features/layout';
import { MainPage } from './pages/main';
import { PokemonPage } from './pages/pokemon';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Menu />
        <Outlet />
      </>
    ),
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/pokemons/:page', element: <MainPage /> },
      { path: '/pokemon/:id', element: <PokemonPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export { App };
