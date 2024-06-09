import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {

  tutorialSidebar: [
    { type: 'doc', id: "introduction"},
    { type: 'category', label: "Агляд", items: [
      "first-steps",
      // "controllers",
    ]},
    // { type: 'category', label: "Асновы", items: []},
    // { type: 'category', label: "Тэхнікі", items: []},
    // { type: 'category', label: "Бяспека", items: []},
    // { type: 'category', label: "GraphQL", items: []},
    // { type: 'category', label: "Вэб-сокеты", items: []},
    // { type: 'category', label: "Мікрасервісы", items: []},
    //STANDALONE APPS
    // { type: 'category', label: "CLI", items: []},
    // { type: 'category', label: "OpenAPI", items: []},
    // { type: 'category', label: "Рэцэпты", items: []},
    // { type: 'category', label: "FAQ", items: []},
    // { type: 'category', label: "Інструменты", items: []},
  ],
};

export default sidebars;
