import { Array, Number, Record, String } from 'runtypes';

const Location = Record({
  id: Number,
  name: String,
  type: String,
  dimension: String,
  residents: Array(String),
});

export { Location };
