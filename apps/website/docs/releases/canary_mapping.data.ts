import { createProjectGraphAsync } from '@nrwl/devkit';

process.env.NX_DAEMON = 'false';

export default {
  async load() {
    const graph = await createProjectGraphAsync();

    return Object.values(graph.nodes)
      .filter(
        (node) => node.type === 'lib' && Boolean(node.data.targets?.build)
      )
      .map((node) => ({
        release: `@farfetched/${node.name}`,
        canary: `@farfetched-canary/${node.name}`,
      }));
  },
};
