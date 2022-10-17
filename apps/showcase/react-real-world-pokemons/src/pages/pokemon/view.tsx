import { useGate } from 'effector-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@farfetched/react';

import { PokemonPageGate, pokemonQuery } from './model';

export function PokemonPage() {
  const params = useParams();

  useGate(PokemonPageGate, { id: Number(params['id']) });

  const { data: pokemon, pending } = useQuery(pokemonQuery);

  if (pending) {
    return <p>Loading ...</p>;
  }

  return (
    <>
      <h2>{pokemon?.name}</h2>
      <table>
        <thead>
          <tr>
            <th>Height</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{pokemon?.height}</td>
            <td>{pokemon?.weight}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
