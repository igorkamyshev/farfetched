import { useGate, useList, useUnit } from 'effector-react';
import { useParams, Link } from 'react-router-dom';

import { Pagination } from '../../features/pagination';
import { $pending, $pokemonList, $totalPages, MainPageGate } from './model';

export function MainPage() {
  const params = useParams();
  const currentPage = Number(params['page'] ?? 1);
  useGate(MainPageGate, { page: currentPage });

  const { totalPages, pending } = useUnit({
    totalPages: $totalPages,
    pending: $pending,
  });

  const items = useList($pokemonList, {
    fn: (item) => (
      <li value={item.id}>
        <Link to={`/pokemon/${item.id}`}>{item.name}</Link>
      </li>
    ),
  });

  return (
    <>
      <h1>Main page</h1>
      {!pending && <ol>{items}</ol>}
      {pending && <p>Loading...</p>}
      {totalPages && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname="/pokemons"
        />
      )}
    </>
  );
}
