import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Telcofy Documentation',
  tagline: 'Transform Telco Data into Value - EU Compliance & Analytics Platform',
  favicon: 'img/logos/favicon_io/favicon-32x32.png',

  url: 'https://telcofy.github.io',
  baseUrl: '/telcofy_docs/',

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

  presets: [
    [
      'classic',
      {
        docs: {
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
        alt: 'Telcofy Logo',
        src: 'img/telcofyPin.png',
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
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'javascript', 'typescript', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;