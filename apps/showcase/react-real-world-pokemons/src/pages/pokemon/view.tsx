import { useGate, useUnit } from 'effector-react';
import { useParams } from 'react-router-dom';

import { $pending, $pokemon, PokemonPageGate } from './model';

export function PokemonPage() {
  const params = useParams();

  useGate(PokemonPageGate, { id: Number(params['id']) });

  const { pokemon, pending } = useUnit({
    pending: $pending,
    pokemon: $pokemon,
  });

  if (pending) {
    return <p>Loading ...</p>;
  }

  return (
    <>
      <h2>{pokemon?.name}</h2>
      <img src={pokemon?.avatarUrl} alt={pokemon?.name} />
      <table>
        <thead>
          <tr>
            <th>Height</th>
            <th>Weight</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{pokemon?.height}</td>
            <td>{pokemon?.weight}</td>
            {pokemon?.color && <td>{pokemon.color}</td>}
          </tr>
        </tbody>
      </table>
    </>
  );
}
