import { StaticOrReactive } from '../misc/sourced';

interface SharedMutationFactoryConfig {
  name?: string;
  enabled?: StaticOrReactive<boolean>;
}

export { type SharedMutationFactoryConfig };
