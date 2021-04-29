---
title: require && import
date: 2021-04-26 11:30
top: false
cover: true
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

## CommonJS modules

Module 既可以是客户端，也可以是服务器端，安全的或不安全的，可以是现在实现的，也可以是将来使用语法扩展的系统支持的

### Module 上下文

- 在一个模块中，有一个自由变量“require”，它是一个函数。
  - require 函数接受一个模块标识符
  - require 返回外部 module 导出的 API
  - 如果存在一个依赖循环，当外部 module 的一个传递依赖项需要它时，它可能还没有完成执行;在这种情况下，如果想要 module 执行，"require"返回的对象必须至少包含外部模块在调用 require(导致当前 module 执行)之前所需的导出。
  - 如果一个 module 不能被导出，requie 必定报错
- 在一个 module 中，有一个自由变量称之为 export，这是一个对象，module 在执行时可以向其添加 API
- module 必须使用 exports 对象作为导出的唯一方法

### module 标识符

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

## ES2015 import

静态的 import 语句用于导入由另一个模块导出的绑定。无论是否声明了 strict mode ，导入的模块都运行在严格模式下。在浏览器中，import 语句只能在声明了 type="module" 的 script 的标签中使用。

```js
// module-name 要导入的模块。通常是包含目标模块的.js文件的相对或绝对路径名，可以不包括.js扩展名
// defaultExport 导入模块的默认导出接口的引用名。
import defaultExport from "module-name";

// name 导入模块对象整体的别名，在引用导入模块时，它将作为一个命名空间来使用。
import * as name from "module-name";

// export, exportN 被导入模块的导出接口的名称。
import { export } from "module-name";
import { export1, export2 } from "module-name";

// alias, aliasN 将引用指定的导入的名称。
import { export as alias } from "module-name";
import { export1 , export2 as alias2 , [...] } from "module-name";

// 整个模块仅为副作用（中性词，无贬义含义）而导入，而不导入模块中的任何内容（接口）
// 这将运行模块中的全局代码, 但实际上不导入任何值
import '/modules/my-module.js';
```

此外，还有一个类似函数的动态 import()，它不需要依赖 type="module" 的 script 标签。

```js
var promise = import("module-name"); //这是一个处于第三阶段的提案。
```

将 myModule 插入当前作用域，其中包含来自位于/modules/my-module.js 文件中导出的所有接口

```js
import * as myModule from "/modules/my-module.js";
```

访问导出接口意味着使用模块名称（在本例为“myModule”）作为命名空间。例如，如果上面导入的模块包含一个接口 doAllTheAmazingThings()，你可以这样调用：

```js
myModule.doAllTheAmazingThings();
```

### 动态 import

标准用法的 import 导入的模块是静态的，会使所有被导入的模块，在加载时就被编译（无法做到按需编译，降低首页加载速度）
有些场景中，你可能希望根据条件导入模块或者按需导入模块，这时你可以使用动态导入代替静态导入。下面的是你可能会需要动态导入的场景：

- 当静态导入的模块很明显的降低了代码的加载速度且被使用的可能性很低，或者并不需要马上使用它
- 当静态导入的模块很明显的占用了大量系统内存且被使用的可能性很低
- 当被导入的模块，在加载时并不存在，需要异步获取
- 当导入模块的说明符，需要动态构建。（静态导入只能使用静态说明符）
- 当被导入的模块有副作用（这里说的副作用，可以理解为模块中会直接运行的代码），这些副作用只有在触发了某些条件才被需要时。（原则上来说，模块不能有副作用，但是很多时候，你无法控制你所依赖的模块的内容）

关键字 import 可以像调用函数一样来动态的导入模块。以这种方式调用，将返回一个 promise

```js
import("/modules/my-module.js").then((module) => {
  // Do something with the module.
});
// 这种使用方式也支持 await 关键字
let module = await import("/modules/my-module.js");
```

标准导入方案：
下面的代码将会演示如何从辅助模块导入以协助处理 AJAX JSON 请求

```js
// file.js
function getJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open("GET", url, true);
  xhr.send();
}

export function getUsefulContents(url, callback) {
  getJSON(url, (data) => callback(JSON.parse(data)));
}

// main.js
import { getUsefulContents } from "/modules/file.js";

getUsefulContents("http://www.example.com", (data) => {
  doSomethingUseful(data);
});
```

动态导入方案：
此示例展示了如何基于用户操作去加载功能模块到页面上，在例子中通过点击按钮，然后会调用模块内的函数。

```js
const main = document.querySelector("main");
for (const link of document.querySelectorAll("nav > a")) {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    import("/modules/my-module.js")
      .then((module) => {
        module.loadPageInto(main);
      })
      .catch((err) => {
        main.textContent = err.message;
      });
  });
}
```

## css/sass/less 文件中的 @import 语句

@import CSS@规则，用于从其他样式表导入样式规则。这些规则必须先于所有其他类型的规则加载
用户代理可以避免为不支持的媒体类型检索资源，作者可以指定依赖媒体的@import 规则。这些条件导入在 URI 之后指定逗号分隔的媒体查询。在没有任何媒体查询的情况下，导入是无条件的。指定所有的媒体具有相同的效果。

> 语法
>
> ```css
> @import url;
> @import url list-of-media-queries;
> ```
>
> url:是一个表示要引入资源位置的 <string> 或者 <uri> (en-US) 。 这个 URL 可以是绝对路径或者相对路径。 要注意的是这个 URL 不需要指明一个文件； 可以只指明包名，然后合适的文件会被自动选择
> list-of-media-queries:是一个逗号分隔的 媒体查询 条件列表，决定通过 URL 引入的 CSS 规则 在什么条件下应用。如果浏览器不支持列表中的任何一条媒体查询条件，就不会引入 URL 指明的 CSS 文件

示例

```css
@import url("fineprint.css") print;
@import "custom.css";
@import url("chrome://communicator/skin/");
@import "common.css" screen;
@import url("landscape.css") screen and (orientation: landscape);
```
