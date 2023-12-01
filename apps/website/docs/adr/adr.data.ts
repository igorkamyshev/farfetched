import { createContentLoader, type SiteConfig } from 'vitepress';

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export default createContentLoader('adr/*.md', {
  transform(rawData) {
    const docs = groupBy(
      rawData.filter((doc) => !doc.url.endsWith('index.html')),
      (item) => item.frontmatter.version
    );

    const releases =
      config.userConfig.themeConfig.sidebar['/releases'].at(0).items;

    return Array.from(docs.entries()).map(([version, docs]) => [
      releases.find((release) => release.text.startsWith(version)) ?? {
        text: version,
      },
      docs,
    ]);
  },
});

function groupBy<T, K>(items: T[], getter: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();

  items.forEach((item) => {
    const group = getter(item);

    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group)!.push(item);
  });

  return groups;
}
