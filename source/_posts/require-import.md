---
title: require && import
date: 2021-04-26 11:30
top: false
cover: false
toc: true
mathjax: true
password:
summary: Module
tags:
  - ECMASCript
  - CommonJS
  - Import
categories:
img: "/medias/featureimages/6.jpg"
sitemap: true
---

# CommonJS modules

Module 既可以是客户端，也可以是服务器端，安全的或不安全的，可以是现在实现的，也可以是将来使用语法扩展的系统支持的

## Module 上下文

- 在一个模块中，有一个自由变量“require”，它是一个函数。
  - require 函数接受一个模块标识符
  - require 返回外部 module 导出的 API
  - 如果存在一个依赖循环，当外部 module 的一个传递依赖项需要它时，它可能还没有完成执行;在这种情况下，如果想要 module 执行，"require"返回的对象必须至少包含外部模块在调用 require(导致当前 module 执行)之前所需的导出。
  - 如果一个 module 不能被导出，requie 必定报错
- 在一个 module 中，有一个自由变量称之为 export，这是一个对象，module 在执行时可以向其添加 API
- module 必须使用 exports 对象作为导出的唯一方法

## module 标识符

- 标识符是由正斜杠分隔的一串术语
  ```js
  const Square = require("./square.js");
  ```
- A term must be a camelCase identifier, ".", or "..".
- module 标识符可能没有像".js"这样的文件扩展名。
- 模块标识符可以是“相对的”或“顶级的”。如果第一项是'.'或“..”，则模块标识符是“相对的”
- 顶级标识符从概念模块的命名空间根解析
- 相对标识符相对于编写和调用“require”的模块的标识符进行解析。

```js
// math.js
exports.add = function () {
  var sum = 0,
    i = 0,
    args = arguments,
    l = args.length;
  while (i < l) {
    sum += args[i++];
  }
  return sum;
};

// increment.js
var add = require("math").add;
exports.increment = function (val) {
  return add(val, 1);
};

// program.js
var inc = require("increment").increment;
var a = 1;
inc(a); // 2
```
