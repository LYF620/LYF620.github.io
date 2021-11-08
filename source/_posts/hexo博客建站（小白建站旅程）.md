---
title: hexo博客建站（小白建站旅程）
date: 2021-02-09 19:10:42
tags:
  - 博客 hexo
  - github
summary: '一篇为小白同伴记录博客建站过程'
img: '/medias/featureimages/1.jpg'
sitemap: true
cover: true
categories: hexo
---

## 搭建环境

因为 hexo 是基于 node 环境，所以这里我们先安装 node.我本人是使用腾讯云的 centos 搭建，所以这里选择使用 yum.这里我们先安装 EPEL 库

```bash
$ sudo yum install epel-release
```

再从官网库下载安装

```bash
$ yum install nodejs
```

node 安装好了，当然是我们的猪脚登场啦!全局安装我们的 hexo 脚手架

```bash
$ npm install hexo-cli -g
```

### nvm node 版本管理

这里强烈为大家推荐一个非常好用的 node 版本管理工具 nvm，它的最强之处在于 node 的版本管理，作为前端扫地僧，常常因为项目不同，node 的版本也需要跟着项目变动，这里如果使用 nvm 的话，一键切换，一键指定版本安装。talk is useless,快去亲自感受一下吧！这里我们可以使用以下两种方式安装：

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
$ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```

查看 nvm 是否安装成功

```bash
$ nvm -v
```

这里附上 nvm 的常用命令：

```bash
$ nvm install 6.9.4
$ nvm list
$ nvm uninstall
$ nvm ls-remote //列出远程服务器上所有可用的版本（非windows用户）
$ nvm ls available //windows用户
$ nvm install node--reinstall-packages-from=node //安装最新版node
```

## 初始化项目

既然环境已经完成，搓搓小手，开始我们的博客搭建旅程~
初始化我们的博客项目

```bash
$ hexo init name //不要傻傻的填name哦，这里是你创建的博客项目的名字
```

初始化完成以后，我们 cd 进去。

```bash
$ npm i
```

然后！这里开始我们 hexo 博客的第一个需要烂熟于心的命令！

```bash
$ hexo g
```

这里全写就是 hexo generate，让 hexo 脚手架生成静态页面，你会在目录下新发现一个 public 文件夹，它就是你的第一个博客宝宝！

号外号外：顺带提一嘴，npm install 可以直接写成 npm i，使用 yarn 的话，yarn install 可以写为 yarn ！
![Eric 真帅!](/meme/detail.jpg)

ok！现在我们的博客页面已经生成好了，当然是机动人心的 start 环节，当当当当~

```bash
$ hexo s
```

哈哈，你以为 s 是 start？你错了，这里我们运行的是 hexo server。ps：我也是在看 hexo 官网才发现的
![Eric 真帅!](/meme/nothin.jpg)

## 哦！恭喜你，你的第一个博客已经搭建好了

根据命令行提示，访问本机 IP:4000 即可，进去之后就是 hexo 的默认界面啦，里面会有一篇经典的 hello world。当然咯，默认的主题，色调都会比较简陋啦，想不想拥有像我一样的漂亮主题？想不想像我一样有一个漂亮的 2d 人物？这里我就不一一 教大家了，贴上链接，大家上手以后就多看看啦。
[hexo 主题](https://hexo.io/themes/ 'https://mdnice.com/')
[Markdown 中文指南](https://www.markdown.xyz/basic-syntax/ 'https://www.markdown.xyz/basic-syntax/')
[hexo 中文文档](https://hexo.io/zh-cn/docs/ 'https://hexo.io/zh-cn/docs/')
