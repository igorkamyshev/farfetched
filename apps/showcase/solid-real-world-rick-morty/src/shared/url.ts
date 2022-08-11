import { Static, String } from 'runtypes';

const Url = String.withBrand('URL');

type TUrl = Static<typeof Url>;

export { Url, type TUrl };
