import type { SiteConfig } from 'vitepress';

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export default {
  load() {
    return config.userConfig.themeConfig.sidebar['/statements'].at(0).items;
  },
};
