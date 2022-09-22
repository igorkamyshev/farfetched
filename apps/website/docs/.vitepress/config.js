export default {
  lang: 'en-US',
  title: 'Farfetched',
  description: 'The advanced data fetching tool for web applications.',
  lastUpdated: true,
  outDir: '../../../dist/apps/website',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
  ],
  themeConfig: {
    siteTitle: 'Farfetched',
    logo: '/logo.svg',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present Igor Kamyşev',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/igorkamyshev/farfetched' },
      { icon: 'twitter', link: 'https://twitter.com/farfetched_dev' },
    ],
    // TODO: use my own search
    // algolia: {
    //   appId: '8J64VVRP8K',
    //   apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
    //   indexName: 'vitepress',
    // },
    nav: [
      {
        text: 'Tutorial',
        link: '/tutorial/',
        activeMatch: '^/tutorial/',
      },
      {
        text: 'Recipes',
        link: '/recipes/',
        activeMatch: '/recipes',
      },

      {
        text: 'Integrations',
        link: '/integrations/',
        activeMatch: '^/integrations/',
      },
      {
        text: 'API',
        link: '/api/',
        activeMatch: '^/api/',
      },
      {
        text: 'More',
        items: [
          {
            text: 'Roadmap',
            link: '/roadmap',
          },
          {
            text: 'Statements',
            link: '/statements/',
          },
          {
            text: 'Releases',
            link: '/releases/',
          },
        ],
      },
    ],
    sidebar: {
      '/tutorial': [
        {
          text: 'Thorough Tutorial',
          collapsible: true,
          items: [
            { text: 'Get started', link: '/tutorial/' },
            { text: 'Installation', link: '/tutorial/install' },
            {
              text: 'Query',
              items: [
                { text: 'Intro to Queries', link: '/tutorial/basic_query' },
                {
                  text: 'Dependent Queries',
                  link: '/tutorial/dependent_queries',
                },
                {
                  text: 'Contracts',
                  link: '/tutorial/contracts',
                },
                {
                  text: 'Built-in factories',
                  link: '/tutorial/built_in_query_factories',
                },
                {
                  text: 'Enhancers',
                  items: [{ text: 'Retries', link: '/tutorial/query_retry' }],
                },
              ],
            },
          ],
        },
      ],
      '/api': [
        {
          text: 'Factories',
          collapsible: true,
          items: [
            { text: 'createQuery', link: '/api/factories/create_query' },
            {
              text: 'createJsonQuery',
              link: '/api/factories/create_json_query',
            },
          ],
        },
        {
          text: 'Operators',
          collapsible: true,
          items: [
            { text: 'connectQuery', link: '/api/operators/connect_query' },
            { text: 'retry', link: '/api/operators/retry' },
          ],
        },
        {
          text: 'Primitives',
          collapsible: true,
          items: [
            { text: 'Query', link: '/api/primitives/query' },
            { text: 'Contract', link: '/api/primitives/contract' },
            { text: 'Validator', link: '/api/primitives/validator' },
          ],
        },
      ],
      '/integrations': [
        {
          text: 'React',
          collapsible: true,
          items: [
            {
              text: 'Get started',
              link: '/integrations/react/',
            },
            { text: 'Suspense', link: '/integrations/react/suspense' },
            {
              text: 'API',
              items: [
                { text: 'useQuery', link: '/integrations/react/api/use_query' },
              ],
            },
          ],
        },
        {
          text: 'Solid',
          collapsible: true,
          items: [
            {
              text: 'Get started',
              link: '/integrations/solid/',
            },
            {
              text: 'API',
              items: [
                {
                  text: 'createQueryResource',
                  link: '/integrations/solid/api/create-query-resource',
                },
              ],
            },
          ],
        },
        {
          text: 'Runtypes',
          collapsible: true,
          items: [
            {
              text: 'Get started',
              link: '/integrations/runtypes/',
            },
            {
              text: 'API',
              items: [
                {
                  text: 'runtypeContract',
                  link: '/integrations/runtypes/api/runtype-contract',
                },
              ],
            },
          ],
        },
      ],
      '/recipes': [
        {
          text: 'How to',
          items: [
            { text: 'Server side rendering', link: '/recipes/ssr' },
            { text: 'Testing', link: '/recipes/testing' },
            {
              text: 'Custom Query',
              items: [
                { text: 'How not to use Fetch API', link: '/recipes/no_fetch' },
                {
                  text: 'Custom Query creation',
                  link: '/recipes/custom_query',
                },
                {
                  text: 'Your own GraphQL Query',
                  link: '/recipes/graphql_query',
                },
              ],
            },
          ],
        },
        {
          text: 'Deep dive',
          collapsible: true,
          items: [{ text: 'Unique store identifiers', link: '/recipes/sids' }],
        },
      ],
      '/statements': [
        {
          text: 'Statements',
          collapsible: false,
          items: [
            { text: 'Releases policy', link: '/statements/releases' },
            {
              text: 'Do not trust remote data',
              link: '/statements/never_trust',
            },
            {
              text: 'Render as you fetch',
              link: '/statements/render_as_you_fetch',
            },
            { text: 'Testing', link: '/statements/tests' },
            { text: 'Effector', link: '/statements/effector' },
            { text: 'TypeScript', link: '/statements/typescript' },
          ],
        },
      ],
      '/releases': [
        {
          text: 'Releases',
          collapsible: false,
          items: [{ text: 'v0.1 Samet Nangshe', link: '/releases/0-1' }],
        },
      ],
    },
  },
};
