import { defaultTheme, defineUserConfig } from 'vuepress'

// 九个阶段分别是：炼气，筑基，金丹，元婴，虚神，凝体，乘鼎，劫变，化真。

export default defineUserConfig({
  base: '/',
  lang: '中文',
  title: 'Eric的学习空间',
  description: '欢迎来到Eric的个人星球',
  markdown: {
    code: {
      lineNumbers:false
    }
  },
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
        text: '🧑‍🦱前端-筑基',
        link: '/contact',
      },
      {
        text: '🧑前端-金丹',
        link: '/contact',
      },
      {
        text: '🧑‍🦲前端-元婴',
        link: '/contact',
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
            children: [{
              text: '网络杂烩-I',
              link: '/base/net/net-1.md',
            },{
              text: '网络杂烩-II',
              link: '/base/net/net-2.md',
            }],
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
          text: '前端入门-筑基',
          children: [
            {
              text: '浏览器',
            },
            {
              text: 'ES6',
            },
            {
              text: 'Fe框架-UI',
            },
            {
              text: '状态管理',
            },
            {
              text: '构建打包',
            },
          ]
        },
      ]
    }

  }),
  
})