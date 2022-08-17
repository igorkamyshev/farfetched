import { Link } from 'atomic-router-solid';
import { Static } from 'runtypes';

import { Location } from './contract';
import { locationRoute } from './model';

function LocationDetails(props: {
  title: string;
  location: Static<typeof Location>;
}) {
  return (
    <section>
      <h2>
        {props.title}: {props.location.name}
      </h2>
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
      <Link to={locationRoute} params={{ locationId: props.location.id }}>
        Open
      </Link>
    </section>
  );
}

export { LocationDetails };
