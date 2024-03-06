import { Record, String } from 'runtypes';

export const Quote = Record({
  author: String,
  quote: String,
});
