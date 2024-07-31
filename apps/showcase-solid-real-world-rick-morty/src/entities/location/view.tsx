import { Link } from 'atomic-router-solid';
import { UnContract } from '@withease/contracts';
import { Show } from 'solid-js';

import { Location } from './contract';
import { locationRoute } from './model';

export function LocationDetails(props: {
  title: string;
  location?: UnContract<typeof Location>;
}) {
  return (
    <Show when={props.location}>
      {(location) => (
        <section>
          <h2>
            {props.title}: {location.name}
          </h2>
          <table>
            <tbody>
              <tr>
                <th>Type</th>
                <td>{location.type}</td>
              </tr>
              <tr>
                <th>Dimension</th>
                <td>{location.dimension}</td>
              </tr>
            </tbody>
          </table>
          <Link to={locationRoute} params={{ locationId: location.id }}>
            Open
          </Link>
        </section>
      )}
    </Show>
  );
}
