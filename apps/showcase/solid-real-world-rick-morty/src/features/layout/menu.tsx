import { Link } from 'atomic-router-solid';

import { characterListRoute } from '../../entities/character';

function Menu() {
  return (
    <nav>
      <Link to={characterListRoute}>Home</Link>
    </nav>
  );
}

export { Menu };
