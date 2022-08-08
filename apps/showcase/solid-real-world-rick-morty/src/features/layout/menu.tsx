import { Link } from 'atomic-router-solid';

import { characterListRoute } from '../../entities/character';
import { episodeListRoute } from '../../entities/episode';

function Menu() {
  return (
    <nav>
      <Link to={characterListRoute}>Characters</Link>
      <Link to={episodeListRoute}>Episodes</Link>
    </nav>
  );
}

export { Menu };
