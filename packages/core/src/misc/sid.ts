// TODO: add serializable
interface OptionalConfig {
  name?: string;
  sid?: string;
}

function mergeOptionalConfig(
  internal: OptionalConfig,
  external?: OptionalConfig
): OptionalConfig {
  if (!external) {
    return {};
  }

  return {
    name: mergeField(internal.name, external.name),
    sid: mergeField(internal.name, external.sid),
  };
}

export { type OptionalConfig, mergeOptionalConfig };

function mergeField(internal?: string, external?: string): string | undefined {
  if (!external || !internal) {
    return undefined;
  }

  return `${external}|${internal}`;
}
