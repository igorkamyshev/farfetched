import { createStore } from 'effector';

export type Serialize<Data> = NonNullable<
  Parameters<typeof createStore<Data>>[1]
>['serialize'];
