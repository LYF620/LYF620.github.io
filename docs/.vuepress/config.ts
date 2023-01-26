import { defaultTheme, defineUserConfig } from 'vuepress'

// 九个阶段分别是：炼气，筑基，金丹，元婴，虚神，凝体，乘鼎，劫变，化真。

export default defineUserConfig({
  base: '/',
  lang: '中文',
  title: 'Eric的学习空间',
  head: [['link', { rel: 'icon', href: '/assets/favicon.png' }]],
  description: '欢迎来到Eric的个人星球',
  theme: defaultTheme({
    // 在这里进行配置
    logo: '/assets/logo.png',
    logoDark: '/assets/logo-dark.png',
    // repo: 'https://github.com/LYF620/LYF620.github.io.git',
    navbar: [
      {
        text: '👦基础-炼气',
         link: '/base/index.md',
      },
      {
        text: '🧑‍🦱FE-筑基',
        link: '/junior/index.md',
      },
      {
        text: '🧑FE-金丹',
        link: '/middle/index.md',
      },
      {
        text: '🧑‍🦲FE-元婴',
        link: '/contact',
      },
      {
        text: '🙋🏻‍♂️每日一题',
        link: '/dailyExercise/index.md',
      },
      {
        text: '🍌个盆友',
        link: '/contact',
      },
    ],
    sidebar: {
      "/base":[{
        text: '开发前置-炼气',
        link: '/base/index.md',
        children: [
          // SidebarItem
          {
            text: '网络',
            children: ['/base/net/net-1.md','/base/net/net-2.md'],
          },
          {
            text: '数据库',
          },
          {
            text: '编译原理',
          },
          {
            text: '算法',
          },
        ],
      }],
      "/junior": [
        {
          text: 'FE-筑基',
          children: [
            {
              text: '浏览器',
            },
            {
              text: 'ES6',
            },
            {
              text: 'FE框架-UI',
            },
            {
              text: '状态管理',
            },
            {
              text: '构建打包',
            },
          ]
        },
      ],
      "/middle": [
        {
          text: 'FE-金丹',
          collapsible: true,
          children: [
            {
              text: 'React',
              link: '/middle/react/index.md',
              children: [
                '/middle/react/development.md'
              ]
            },
            {
              text: 'Vue',
            },
             {
              text: '组件库',
            },
          ]
        },
      ],
      "/dailyExercise": [
        '/dailyExercise/index.md'
      ],
    }

  }),
  
})