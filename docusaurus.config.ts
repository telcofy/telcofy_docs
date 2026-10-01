import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Telcofy Documentation',
  tagline: 'Transform Telco Data into Value - EU Compliance & Analytics Platform',
  favicon: 'brand/telcofy-mark.svg',

  url: 'https://docs.telcofy.ai',
  baseUrl: '/',

  organizationName: 'telcofy',
  projectName: 'telcofy_docs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Reports page views on every route change, behind the cookie consent gate.
  clientModules: [require.resolve('./src/clientModules/routeAnalytics.ts')],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/telcofy/telcofy_docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Telcofy.`,
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/telcofy-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Telcofy',
      logo: {
        alt: 'Telcofy',
        src: 'brand/telcofy-mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation 🚧',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/telcofy',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    // Kept deliberately minimal: it exists so the cookie notice and the
    // "Cookie settings" control are reachable from every page (see
    // src/theme/Footer/Copyright).
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} Telcofy`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'javascript', 'typescript', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;