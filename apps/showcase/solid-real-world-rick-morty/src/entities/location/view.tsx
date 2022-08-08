import { Link } from 'atomic-router-solid';
import { Static } from 'runtypes';
import { Match, Switch } from 'solid-js';

import { Location } from './contract';
import { locationRoute } from './model';

function LocationDetails(props: {
  pending: boolean;
  location: Static<typeof Location> | null;
}) {
  return (
    <Switch>
      <Match when={props.location === null && props.pending}>Loading...</Match>
      <Match when={props.location !== null && !props.pending}>
        <table>
          <tbody>
            <tr>
              <th>Type</th>
              <td>{props.location?.type}</td>
            </tr>
            <tr>
              <th>Dimension</th>
              <td>{props.location?.dimension}</td>
            </tr>
          </tbody>
        </table>
        <Link to={locationRoute} params={{ locationId: props.location!.id }}>
          Open
        </Link>
      </Match>
    </Switch>
  );
}

export { LocationDetails };
