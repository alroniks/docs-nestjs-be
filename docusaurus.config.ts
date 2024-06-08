import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Дакументацыя | NestJS – прагрэсіўны Node.js фрэймворк',
  tagline: 'Прагрэсіўны Node.js фрэймворк для стварэння эфектыўных, здольных да пашырэння, серверных праграм карпаратыўнага ўзроўню, з выкарыстаннем моў праграмавання TypeScript і JavaScript 🚀',
  favicon: 'img/favicon.ico',

  trailingSlash: false,

  url: 'https://docs-nestjs-be.netlify.app/',
  baseUrl: '/',

  // onBrokenLinks: 'throw',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'be',
    locales: ['be'],
    localeConfigs: {
      be: { htmlLang: 'be-BY' },
    },
  },

  presets: [
    [
      'classic',
      {
        blog: false,
        docs: {
          path: 'convert/be',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          sidebarCollapsible: true,
          sidebarCollapsed: false,
          showLastUpdateAuthor: true,
          editUrl: 'https://github.com/alroniks/docs-nestjs-be/tree/main/convert/be/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: '/img/nestjs-social-card.png',
    tableOfContents: {
      minHeadingLevel: 4,
      maxHeadingLevel: 6,
    },
    navbar: {
      title: 'NestJS',
      logo: {
        src: '/img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Дакументацыя',
        },
        {
          href: 'https://github.com/alroniks/docs-nestjs-be',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Alroniks Technologoes, Ltd. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@polymetis-apps/pirsch-docusaurus', {
        code: "oJlVPB4xDoajxtpdROJEhwcD6BqlvjVI" 
      }
    ],
  ],
  
};

export default config;
