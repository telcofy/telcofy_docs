import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Telcofy Documentation',
  tagline: 'Comprehensive guides and resources for Telcofy platform',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://telcofy.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/telcofy_docs/',

  // GitHub pages deployment config
  organizationName: 'telcofy', // Usually your GitHub org/user name.
  projectName: 'telcofy_docs', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/telcofy/telcofy_docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/telcofy/telcofy_docs/tree/main/',
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
    // Replace with your project's social card
    image: 'img/telcofy-social-card.jpg',
    navbar: {
      title: 'Telcofy',
      logo: {
        alt: 'Telcofy Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'dropdown',
          label: 'Resources',
          position: 'left',
          items: [
            {
              label: 'API Reference',
              to: '/docs/api',
            },
            {
              label: 'SDKs',
              to: '/docs/sdks',
            },
            {
              label: 'Tutorials',
              to: '/docs/tutorials',
            },
          ],
        },
        {
          href: 'https://github.com/telcofy/telcofy_docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
            {
              label: 'Tutorials',
              to: '/docs/tutorials',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/telcofy',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/telcofy',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/telcofy',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Support',
              href: 'mailto:support@telcofy.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Telcofy. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'javascript', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;