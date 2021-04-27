---
title: 巨TM详细的Webpack入门(一)
date: 2021-04-25 10:00
top: false
cover: true
toc: true
mathjax: true
password:
summary: "webpack"
tags:
  - webpack
  - webpack基础
  - 巨TM详细
categories:
img: "/medias/featureimages/5.jpg"
sitemap: true
---

# 什么是 webpack

webpack 是一个现代 JavaScript 应用程序的静态模块打包器（module bundler）。当 webpack 处理应用程序时，通过递归关系构建一个依赖关系图，其中包含该应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle（bundle 会在下文讲解）。

# entry[入口]

入口起点（entry point）指示 webpack 应该使用哪个模块作为构建其内部依赖图的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖。每个依赖项随即被处理，最后输出到称之为 bundles 的文件中.
配置 entry，指定一个或多个入口起点，默认值为'./src'
用法：entry: string|Array<string>

## 单个入口语法

```js
module.exports = {
  entry: "./path/to/my/entry/file.js",
};
```

> 当你向 entry 传入一个数组时会发生什么？向 entry 属性传入「文件路径(file path)数组」将创建“多个主入口(multi-main entry)”。在你想要多个依赖文件一起注入，并且将它们的依赖导向(graph)到一个“chunk”时，传入数组的方式就很有用。

## 对象语法

用法：entry: {[entryChunkName: string]: string|Array<string>}

```js
module.exports = {
  entry: {
    app: "./src/app.js",
    vendors: "./src/vendors.js",
  },
};
```

对象语法会比较繁琐。然而，这是应用程序中定义入口的最可扩展的方式。

> “可扩展的 webpack 配置”是指，可重用并且可以与其他配置组合使用。这是一种流行的技术，用于将关注点(concern)从环境(environment)、构建目标(build target)、运行时(runtime)中分离。然后使用专门的工具（如 webpack-merge）将它们合并。

## 常见场景

以下列出一些入口配置和它们的实际用例：

- 分离 应用程序(app) 和 第三方库(vendor) 入口

  ```js
  module.exports = {
    entry: {
      app: "./src/app.js",
      vendors: "./src/vendors.js",
    },
  };
  ```

  webpack 从 app.js 和 vendors.js 开始创建依赖图(dependency graph)。这些依赖图是彼此完全分离、互相独立的（每个 bundle 中都有一个 webpack 引导(bootstrap)）。这种方式比较常见于，只有一个入口起点（不包括 vendor）的单页应用程序(single page application)中。

  此设置允许你使用 CommonsChunkPlugin 从「应用程序 bundle」中提取 vendor 引用(vendor reference) 到 vendor bundle，并把引用 vendor 的部分替换为 **webpack_require**() 调用。如果应用程序 bundle 中没有 vendor 代码，那么你可以在 webpack 中实现被称为长效缓存的通用模式。

- 多页面应用程序

  ```js
  module.exports = {
    entry: {
      pageOne: "./src/pageOne/index.js",
      pageTwo: "./src/pageTwo/index.js",
      pageThree: "./src/pageThree/index.js",
    },
  };
  ```

  这里我们告诉 webpack 需要 3 个独立分离的依赖图（如上面的示例）。
  在多页应用中，（译注：每当页面跳转时）服务器将为你获取一个新的 HTML 文档。页面重新加载新文档，并且资源被重新下载。然而，这给了我们特殊的机会去做很多事：

  - 使用 CommonsChunkPlugin 为每个页面间的应用程序共享代码创建 bundle。由于入口起点增多，多页应用能够复用入口起点之间的大量代码/模块，从而可以极大地从这些技术中受益。

# 出口[output]

output 属性告诉 webpack 在哪里输出它所创建的 bundles，以及如何命名这些文件，默认值为 ./dist。基本上，整个应用程序结构，都会被编译到你指定的输出路径的文件夹中。你可以通过在配置中指定一个 output 字段，来配置这些处理过程
output 位于对象最顶级键(key)，包括了一组选项，指示 webpack 如何去输出、以及在哪里输出你的「bundle、asset 和其他你所打包或使用 webpack 载入的任何内容」。

## 单个入口语法

```js
const path = require("path");

module.exports = {
  entry: "./path/to/my/entry/file.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    //path: bundle 生成(emit)到哪里
    filename: "my-first-webpack.bundle.js",
    //filename: webpack bundle 的名称
  },
};
```

## 多个入口语法

如果配置创建了多个单独的 "chunk"（例如，使用多个入口起点或使用像 CommonsChunkPlugin 这样的插件），则应该使用占位符(substitutions)来确保每个文件具有唯一的名称。

```js
{
  entry: {
    app: './src/app.js',
    search: './src/search.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  }
}
```

> 占位符：
>
> > 对于单个入口起点，filename 会是一个静态名称。
> > filename: "bundle.js"
> > 然而，当通过多个入口起点(entry point)、代码拆分(code splitting)或各种插件(plugin)创建多个 bundle，应该使用以下一种替换方式，来赋予每个 bundle 一个唯一的名称……
> > 使用入口名称：
> > filename: "[name].bundle.js"
> > 使用内部 chunk id
> > filename: "[id].bundle.js"
> > 使用每次构建过程中，唯一的 hash 生成
> > filename: "[name].[hash].bundle.js"
> > 使用基于每个 chunk 内容的 hash：
> > filename: "[chunkhash].bundle.js"
> > 注意此选项被称为文件名，但是你还是可以使用像 "js/[name]/bundle.js" 这样的文件夹结构。
> > 对于这些文件，请使用 output.chunkFilename 选项来控制输出。

| 模板 | 描述 |
| [hash] | 模块标识符(module identifier)的 hash |
| [chunkhash] | chunk 内容的 hash |
| [name] | 模块名称 |
| [id] | 模块标识符(module identifier) |
| [query] | 模块的 query，例如，文件名 ? 后面的字符串 |
[hash] 和 [chunkhash] 的长度可以使用 [hash:16]（默认为 20）来指定。或者，通过指定 output.hashDigestLength 在全局配置长度。

### 使用 CDN 和资源 hash

```js
module.exports = {
  entry: "./path/to/my/entry/file.js",
  output: {
    path: "/home/proj/cdn/assets/[hash]",
    publicPath: "http://cdn.example.com/assets/[hash]/",
  },
};
```

> 在编译时不知道最终输出文件的 publicPath 的情况下，publicPath 可以留空，并且在入口起点文件运行时动态设置。如果你在编译时不知道 publicPath，你可以先忽略它，并且在入口起点设置 **webpack_public_path**。

```js
__webpack_public_path__ = myRuntimePublicPath;

// 剩余的应用程序入口
```

# loader

loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。loader 可以将所有类型的文件转换为 webpack 能够处理的有效模块，然后你就可以利用 webpack 的打包能力，对它们进行处理。本质上，webpack loader 将所有类型的文件，转换为应用程序的依赖图（和最终的 bundle）可以直接引用的模块。

> 注意，loader 能够 import 导入任何类型的模块（例如 .css 文件），这是 webpack 特有的功能，其他打包程序或任务执行器的可能并不支持。这种语言扩展是有很必要的，因为这可以使开发人员创建出更准确的依赖关系图。

在 webpack 的配置中 loader 有两个目标：

- test 属性，用于标识出应该被对应的 loader 进行转换的某个或某些文件。
- use 属性，表示进行转换时，应该使用哪个 loader。

## loader 的三种使用方式

- 配置（最省事）：在 webpack.config.js 文件中指定 loader。

```js
const path = require("path");

const config = {
  output: {
    filename: "my-first-webpack.bundle.js",
  },
  module: {
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
};

module.exports = config;
```

以上配置中，对一个单独的 module 对象定义了 rules 属性，里面包含两个必须属性：test 和 use。这告诉 webpack 编译器(compiler) 如下信息：

> “嘿，webpack 编译器，当你碰到「在 require()/import 语句中被解析为 '.txt' 的路径」时，在你对它打包之前，先使用 raw-loader 转换一下。”

- 内联：在每个 import 语句中显式指定 loader。
  可以在 import 语句或任何等效于 "import" 的方式中指定 loader。使用 ! 将资源中的 loader 分开。分开的每个部分都相对于当前目录解析。

  ```js
  import Styles from "style-loader!css-loader?modules!./styles.css";
  ```

  通过前置所有规则及使用 !，可以对应覆盖到配置中的任意 loader。
  选项可以传递查询参数，例如 ?key=value&foo=bar，或者一个 JSON 对象，例如 ?{"key":"value","foo":"bar"}。

- CLI：在 shell 命令中指定它们。

```shell
webpack --module-bind jade-loader --module-bind 'css=style-loader!css-loader'
```

这会对 .jade 文件使用 jade-loader，对 .css 文件使用 style-loader 和 css-loader。

## loader 的特性

- loader 支持链式传递。能够对资源使用流水线(pipeline)。一组链式的 loader 将按照相反的顺序执行。loader 链中的第一个 loader 返回值给下一个 loader。在最后一个 loader，返回 webpack 所预期的 JavaScript。
- loader 可以是同步的，也可以是异步的。
- loader 运行在 Node.js 中，并且能够执行任何可能的操作。
- loader 接收查询参数。用于对 loader 传递配置。
- loader 也能够使用 options 对象进行配置。
- 除了使用 package.json 常见的 main 属性，还可以将普通的 npm 模块导出为 loader，做法是在 package.json 里定义一个 loader 字段。（自定义 loader）
- 插件(plugin)可以为 loader 带来更多特性。
- loader 能够产生额外的任意文件。

loader 通过（loader）预处理函数，为 JavaScript 生态系统提供了更多能力。 用户现在可以更加灵活地引入细粒度逻辑，例如压缩、打包、语言翻译和其他更多。

## 解析 loader

loader 遵循标准的模块解析。多数情况下，loader 将从模块路径（通常将模块路径认为是 npm install, node_modules）解析
loader 模块需要导出为一个函数，并且使用 Node.js 兼容的 JavaScript 编写。通常使用 npm 进行管理，但是也可以将自定义 loader 作为应用程序中的文件。按照约定，loader 通常被命名为 xxx-loader（例如 json-loader）。

# 插件[plugins]

loader 被用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量。插件接口功能极其强大，可以用来处理各种各样的任务。

想要使用一个插件，你只需要 require() 它，然后把它添加到 plugins 数组中。多数插件可以通过选项(option)自定义。你也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 new 操作符来创建它的一个实例。

```js
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 通过 npm 安装
const webpack = require("webpack"); // 用于访问内置插件

const config = {
  module: {
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],
};

module.exports = config;
```

```js
const HtmlWebpackPlugin = require("html-webpack-plugin"); //通过 npm 安装
const webpack = require("webpack"); //访问内置的插件
const path = require("path");

const config = {
  entry: "./path/to/my/entry/file.js",
  output: {
    filename: "my-first-webpack.bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
  ],
};

module.exports = config;
```

## 剖析

webpack 插件是一个具有 apply 属性的 JavaScript 对象。apply 属性会被 webpack compiler 调用，并且 compiler 对象可在整个编译生命周期访问。

ConsoleLogOnBuildWebpackPlugin.js

```js
const pluginName = "ConsoleLogOnBuildWebpackPlugin";

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log("webpack 构建过程开始！");
    });
  }
}
```

compiler hook 的 tap 方法的第一个参数，应该是驼峰式命名的插件名称。建议为此使用一个常量，以便它可以在所有 hook 中复用。

> 由于插件可以携带参数/选项，你必须在 webpack 配置中，向 plugins 属性传入 new 实例。

## Node API(这部分不理解)

some-node-script.js

```js
const webpack = require("webpack"); //访问 webpack 运行时(runtime)
const configuration = require("./webpack.config.js");

let compiler = webpack(configuration);
compiler.apply(new webpack.ProgressPlugin());

compiler.run(function (err, stats) {
  // ...
});
```

> 以上看到的示例和 webpack 自身运行时(runtime) 极其类似。wepback 源码中隐藏有大量使用示例，你可以用在自己的配置和脚本中。

# 模式[mode]

通过选择 development 或 production 之中的一个，来设置 mode 参数，你可以启用相应模式下的 webpack 内置的优化

```js
module.exports = {
  mode: "production",
};
```

或者通过命令行传递：

```shell
webpack --mode=production
```

支持下面两种字符串值：

| 模板 | 描述 |
| 选项 | 描述 |
| development | 会将 process.env.NODE_ENV 的值设为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。 |
| production | 会将 process.env.NODE_ENV 的值设为 production。启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 UglifyJsPlugin. |

> !!!! 只设置 NODE_ENV，则不会自动设置 mode。

## mode: development

```js
// webpack.development.config.js
module.exports = {
+ mode: 'development'
- plugins: [
-   new webpack.NamedModulesPlugin(),
-   new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") }),
- ]
}

```

### mode: production

```js
// webpack.production.config.js
module.exports = {
+  mode: 'production',
-  plugins: [
-    new UglifyJsPlugin(/* ... */),
-    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
-    new webpack.optimize.ModuleConcatenationPlugin(),
-    new webpack.NoEmitOnErrorsPlugin()
-  ]
}
```

# 配置[configuration]

很少有 webpack 配置看起来很完全相同。因为 webpack 的配置文件，是导出一个对象的 JavaScript 文件。此对象，由 webpack 根据对象定义的属性进行解析。
webpack 配置是标准的 Node.js CommonJS 模块，你可以做到以下事情：

- 通过 require(...) 导入其他文件
- 通过 require(...) 使用 npm 的工具函数
- 使用 JavaScript 控制流表达式，例如 ?: 操作符
- 对常用值使用常量或变量
- 编写并执行函数来生成部分配置

不推荐的做法：

- 在使用 webpack 命令行接口(CLI)（应该编写自己的命令行接口(CLI)，或使用 --env）时，访问命令行接口(CLI)参数
- 导出不确定的值（调用 webpack 两次应该产生同样的输出文件）
- 编写很长的配置（应该将配置拆分为多个文件）

接下来的例子展示了 webpack 配置对象(webpack configuration object)如何即具有表现力，又具有可配置性，

## 基本配置：

```js
var path = require("path");

module.exports = {
  mode: "development",
  entry: "./foo.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "foo.bundle.js",
  },
};
```

### 导出为一个函数

需要在开发和生产构建之间，消除 webpack.config.js 的差异。（至少）有两种选项：
作为导出一个配置对象的替代，还有一种可选的导出方式是，从 webpack 配置文件中导出一个函数。该函数在调用时，可传入两个参数：

- 环境对象(environment)作为第一个参数。一个选项 map 对象（argv）作为第二个参数。这个对象描述了传递给 webpack 的选项，并且具有 output-filename 和 optimize-minimize 等 key。

```js
-module.exports = {
+module.exports = function(env, argv) {
+  return {
+    mode: env.production ? 'production' : 'development',
+    devtool: env.production ? 'source-maps' : 'eval',
     plugins: [
       new webpack.optimize.UglifyJsPlugin({
+        compress: argv['optimize-minimize'] // 只有传入 -p 或 --optimize-minimize
       })
     ]
+  };
};
```

### 导出一个 Promise

webpack 将运行由配置文件导出的函数，并且等待 Promise 返回。便于需要异步地加载所需的配置变量。

```js
module.exports = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        entry: "./app.js",
        /* ... */
      });
    }, 5000);
  });
};
```

### 导出多个配置对象

作为导出一个配置对象/配置函数的替代，你可能需要导出多个配置对象（从 webpack 3.1.0 开始支持导出多个函数）。当运行 webpack 时，所有的配置对象都会构建。例如，导出多个配置对象，对于针对多个构建目标（例如 AMD 和 CommonJS）打包一个 library 非常有用。

```js
module.exports = [
  {
    output: {
      filename: "./dist-amd.js",
      libraryTarget: "amd",
    },
    entry: "./app.js",
    mode: "production",
  },
  {
    output: {
      filename: "./dist-commonjs.js",
      libraryTarget: "commonjs",
    },
    entry: "./app.js",
    mode: "production",
  },
];
```

### 根据不同语言进行配置

- TypeScript
  为了用 TypeScript 书写 webpack 的配置文件，必须先安装相关依赖：

  ```shell
  npm install --save-dev typescript ts-node @types/node @types/webpack
  ```

  之后就可以使用 TypeScript 书写 webpack 的配置文件了：

  ```js
  import path from "path";
  import webpack from "webpack";
  const config: webpack.Configuration = {
    mode: "production",
    entry: "./foo.js",
    output: {
      path: path.resolve(_dirname, "dist"),
      filename: "foo.bundle.js",
    },
  };
  export default config;
  ```

  以上示例假定 webpack 版本 >= 2.7，或者，在 tsconfig.json 文件中，具有 esModuleInterop 和 allowSyntheticDefaultImports 这两个新的编译器选项的较新版本 TypeScript。

  注意，你还需要核对 tsconfig.json 文件。如果 tsconfig.json 中的 compilerOptions 中的 module 字段是 commonjs ，则配置是正确的，否则 webpack 将因为错误而构建失败。发生这种情况，是因为 ts-node 不支持 commonjs 以外的任何模块语法。
  这个问题有两种解决方案：

  - 修改 tsconfig.json
  - 安装 tsconfig-paths
    \_*第一个选项*是指，打开你的 tsconfig.json 文件并查找 compilerOptions。将 target 设置为 "ES5"，以及将 module 设置为 "CommonJS"（或者完全移除 module 选项）。
    \_*第二个选项*是指，安装 tsconfig-paths 包：

  ```js
    npm install --save-dev tsconfig-paths
  ```

  然后，为你的 webpack 配置，专门创建一个单独的 TypeScript 配置：
  tsconfig-for-webpack-config.json

  ```js
    {
    "compilerOptions": {
      "module": "commonjs",
      "target": "es5"
      }
    }
  ```

  > ts-node 可以使用 tsconfig-path 提供的环境变量来解析 tsconfig.json 文件。

  然后，设置 tsconfig-path 提供的环境变量 process.env.TS_NODE_PROJECT，如下所示：

  ```js
  {
    "scripts": {
      "build": "TS_NODE_PROJECT=\"tsconfig-for-webpack-config.json\" webpack"
    }
  }
  ```

- Babel and JSX
  首先安装依赖：

  ```shell
    npm install --save-dev babel-register jsxobj babel-preset-es2015
  ```

  .babelrc

  ```shell
    {
      "presets": [ "es2015" ]
    }
  ```

  webpack.config.babel.js

  ```js
  import jsxobj from "jsxobj";

  // example of an imported plugin
  const CustomPlugin = (config) => ({
    ...config,
    name: "custom-plugin",
  });

  export default (
    <webpack target="web" watch mode="production">
      <entry path="src/index.js" />
      <resolve>
        <alias
          {...{
            react: "preact-compat",
            "react-dom": "preact-compat",
          }}
        />
      </resolve>
      <plugins>
        <uglify-js
          opts={{
            compression: true,
            mangle: false,
          }}
        />
        <CustomPlugin foo="bar" />
      </plugins>
    </webpack>
  );
  ```

  > 如果你在其他地方也使用了 Babel 并且把模块(modules)设置为了 false，那么你要么同时维护两份单独的 .babelrc 文件，要么使用 conts jsxobj = requrie('jsxobj'); 并且使用 moduel.exports 而不是新版本的 import 和 export 语法。这是因为尽管 Node.js 已经支持了许多 ES6 的新特性，然而还无法支持 ES6 模块语法。

# 模块[modules]

在模块化编程中，开发者将程序分解成离散功能块(discrete chunks of functionality)，并称之为模块。

每个模块具有比完整程序更小的接触面，使得校验、调试、测试轻而易举。 精心编写的模块提供了可靠的抽象和封装界限，使得应用程序中每个模块都具有条理清楚的设计和明确的目的。

Node.js 从最一开始就支持模块化编程。然而，在 web，模块化的支持正缓慢到来。在 web 存在多种支持 JavaScript 模块化的工具，这些工具各有优势和限制。webpack 基于从这些系统获得的经验教训，并将模块的概念应用于项目中的任何文件。

## 什么是 webpack 模块

对比 Node.js 模块，webpack 模块能够以各种方式表达它们的依赖关系，几个例子如下：

- ES2015 import 语句
- CommonJS require() 语句
- AMD define 和 require 语句
- css/sass/less 文件中的 @import 语句
- 样式(url(...))或 HTML 文件(<img src=...>)中的图片链接(image url)

> webpack 1 需要特定的 loader 来转换 ES 2015 import，然而通过 webpack 2 可以开箱即用。

## 支持的模块类型

webpack 通过 loader 可以支持各种语言和预处理器编写模块。loader 描述了 webpack 如何处理 非 JavaScript(non-JavaScript) _模块_，并且在 bundle 中引入这些依赖。 webpack 社区已经为各种流行语言和语言处理器构建了 loader，包括：

- CoffeeScript
- TypeScript
- ESNext (Babel)
- Sass
- Less
- Stylus

# 模块解析[module resolution]

resolver 是一个库(library)，用于帮助找到模块的绝对路径。一个模块可以作为另一个模块的依赖模块，然后被后者引用，如下：

```js
import foo from "path/to/module";
// 或者
require("path/to/module");
```

所依赖的模块可以是来自应用程序代码或第三方的库(library)。resolver 帮助 webpack 找到 bundle 中需要引入的模块代码，这些代码在包含在每个 require/import 语句中。 当打包模块时，webpack 使用 enhanced-resolve 来解析文件路径

### webpack 中的解析规则

使用 enhanced-resolve，webpack 能够解析三种文件路径：

- 绝对路径

  ```js
  import "/home/me/file";

  import "C:\\Users\\me\\file";
  ```

  由于我们已经取得文件的绝对路径，因此不需要进一步再做解析。

- 相对路径

  ```js
  import "../src/file1";
  import "./file2";
  ```

  在这种情况下，使用 import 或 require 的资源文件(resource file)所在的目录被认为是上下文目录(context directory)。在 import/require 中给定的相对路径，会添加此上下文路径(context path)，以产生模块的绝对路径(absolute path)。

- 模块路径

  ```js
  import "module";
  import "module/lib/file";
  ```

  模块将在 resolve.modules 中指定的所有目录内搜索。 你可以替换初始模块路径，此替换路径通过使用 resolve.alias 配置选项来创建一个别名。
  一旦根据上述规则解析路径后，解析器(resolver)将检查路径是否指向文件或目录。如果路径指向一个文件：

  - 如果路径具有文件扩展名，则被直接将文件打包。
  - 否则，将使用 [resolve.extensions] 选项作为文件扩展名来解析，此选项告诉解析器在解析中能够接受哪些扩展名（例如 .js, .jsx）。

  如果路径指向一个文件夹，则采取以下步骤找到具有正确扩展名的正确文件：

  - 如果文件夹中包含 package.json 文件，则按照顺序查找 resolve.mainFields 配置选项中指定的字段。并且 package.json 中的第一个这样的字段确定文件路径。
  - 如果 package.json 文件不存在或者 package.json 文件中的 main 字段没有返回一个有效路径，则按照顺序查找 resolve.mainFiles 配置选项中指定的文件名，看是否能在 import/require 目录下匹配到一个存在的文件名。
  - 文件扩展名通过 resolve.extensions 选项采用类似的方法进行解析。

  webpack 根据构建目标(build target)为这些选项提供了合理的默认配置。

### 解析 Loader[Resolving Loaders]

Loader 解析遵循与文件解析器指定的规则相同的规则。但是 resolveLoader 配置选项可以用来为 Loader 提供独立的解析规则。

- resolveLoader
  与 resolve 对象的属性集合相同，但仅用于解析 webpack 的 loader 包。默认：
  ```js
    {
     modules: [ 'node_modules' ],
     extensions: [ '.js', '.json' ],
     mainFields: [ 'loader', 'main' ]
    }
  ```
  > 这里你可以使用别名，并且其他特性类似于 resolve 对象。例如，{ txt: 'raw-loader' } 会使用 raw-loader 去 shim(填充) txt!templates/demo.txt。
- resolveLoader.moduleExtensions
  解析 loader 时，用到扩展名(extensions)/后缀(suffixes)。
  如果你想省略 -loader，也就是说只使用 example，则可以使用此选项来实现：
  ```js
  moduleExtensions: ["-loader"];
  ```

### 缓存

每个文件系统访问都被缓存，以便更快触发对同一文件的多个并行或串行请求。在观察模式下，只有修改过的文件会从缓存中摘出。如果关闭观察模式，在每次编译前清理缓存。

# webpack 打包后的文件如何在浏览器中跑起来？

在使用 webpack 构建的典型应用程序或站点中，有三种主要的代码类型：

- 你或你的团队编写的源码。
- 你的源码会依赖的任何第三方的 library 或 "vendor" 代码。
- webpack 的 runtime 和 manifest，管理所有模块的交互。

## Manifest

一旦你的应用程序中，形如 index.html 文件、一些 bundle 和各种资源加载到浏览器中，会发生什么？你精心安排的 /src 目录的文件结构现在已经不存在，所以 webpack 如何管理所有模块之间的交互呢？这就是 manifest 数据用途的由来……

当编译器(compiler)开始执行、解析和映射应用程序时，它会保留所有模块的详细要点。这个数据集合称为 "Manifest"，当完成打包并发送到浏览器时，会在运行时通过 Manifest 来解析和加载模块。无论你选择哪种模块语法，那些 import 或 require 语句现在都已经转换为 **webpack_require** 方法，此方法指向模块标识符(module identifier)。通过使用 manifest 中的数据，runtime 将能够查询模块标识符，检索出背后对应的模块。

## Runtime

runtime，以及伴随的 manifest 数据，主要是指：在浏览器运行时，webpack 用来连接模块化的应用程序的所有代码。runtime 包含：在模块交互时，连接模块所需的加载和解析逻辑。包括浏览器中的已加载模块的连接，以及懒加载模块的执行逻辑

> Runtime 和 Manifest
> 这两个定义在大多数情况下没有用途。runtime 会做自己该做的，使用 manifest 来执行其操作，一般不需要用户关心。但一旦你的应用程序加载到浏览器中，所有内容将展现出魔幻般运行。然而，如果你决定通过使用浏览器缓存来改善项目的性能，理解这一过程将突然变得尤为重要。
> 通过使用 bundle 计算出内容散列(content hash)作为文件名称，这样在内容或文件修改时，浏览器中将通过新的内容散列指向新的文件，从而使缓存无效。一旦你开始这样做，你会立即注意到一些有趣的行为。即使表面上某些内容没有修改，计算出的哈希还是会改变。这是因为，runtime 和 manifest 的注入在每次构建都会发生变化。

# 构建目标[targets]

因为服务器和浏览器代码都可以用 JavaScript 编写，所以 webpack 提供了多种构建目标(target)，你可以在你的 webpack 配置中设置。

## 用法

target 用于告知 webpack 为目标(target)指定一个环境。
要设置 target 属性，只需要在你的 webpack 配置中设置 target 的值。

```js
module.exports = {
  target: "node",
};
```

在上面例子中，使用 node webpack 会编译为用于「类 Node.js」环境（使用 Node.js 的 require ，而不是使用任意内置模块（如 fs 或 path）来加载 chunk）。

> target 通过 WebpackOptionsApply ，可以支持以下字符串值：
> | 选项 | 描述 |
> | async-node | 编译为类 Node.js 环境可用（使用 fs 和 vm 异步加载分块） |
> | electron-main | 编译为 Electron 主进程。 |
> | electron-renderer | 编译为 Electron 渲染进程，使用 JsonpTemplatePlugin, FunctionModulePlugin 来为浏览器环境提供目标，使用 NodeTargetPlugin 和 ExternalsPlugin 为 CommonJS 和 Electron 内置模块提供目标。 |
> | node | 编译为类 Node.js 环境可用（使用 Node.js require 加载 chunk） |
> | node-webkit | 编译为 Webkit 可用，并且使用 jsonp 去加载分块。支持 Node.js 内置模块和 nw.gui 导入（实验性质）|
> | web | 编译为类浏览器环境里可用（默认）|
> | webworker | 编译成一个 WebWorker |

例如，当 target 设置为 "electron"，webpack 引入多个 electron 特定的变量。有关使用哪些模板和 externals 的更多信息

如果传入一个函数，此函数调用时会传入一个 compiler 作为参数。如果以上列表中没有一个预定义的目标(target)符合你的要求，请将其设置为一个函数。
例如，如果你不需要使用以上任何插件：

```js
const options = {
  target: () => undefined,
};
```

或者可以使用你想要指定的插件

```js
const webpack = require("webpack");

const options = {
  target: (compiler) => {
    compiler.apply(
      new webpack.JsonpTemplatePlugin(options.output),
      new webpack.LoaderTargetPlugin("web")
    );
  },
};
```

## 多个 target

尽管 webpack 不支持向 target 传入多个字符串，你可以通过打包两份分离的配置来创建同构的库：

```js
var path = require("path");
var serverConfig = {
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "lib.node.js",
  },
  //…
};

var clientConfig = {
  target: "web", // <=== 默认是 'web'，可省略
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "lib.js",
  },
  //…
};

module.exports = [serverConfig, clientConfig];
```

上面的例子将在你的 dist 文件夹下创建 lib.js 和 lib.node.js 文件。

# 模块热替换[hot module replacement]

模块热替换(HMR - Hot Module Replacement)功能会在应用程序运行过程中替换、添加或删除模块，而无需重新加载整个页面。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面时丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 调整样式更加快速 - 几乎相当于在浏览器调试器中更改样式。

## 热更新模块是如何运行的

让我们从一些不同的角度观察，以了解 HMR 的工作原理……

#### 在应用程序中

通过以下步骤，可以做到应用程序中置换模块：

- 应用程序代码要求 HMR runtime 检查更新
- HMR runtime（异步）下载更新，然后通知应用程序代码
- 应用程序代码要求 HMR runtime 应用更新
- HMR runtime（同步）应用更新

你可以设置 HMR，以使此进程自动触发更新，或者你可以选择要求在用户交互时进行更新。

#### 在编译器中

除了普通资源，编译器(compiler)需要发出 "update"，以允许更新之前的版本到新的版本。"update" 由两部分组成：

- 更新后的 manifest(JSON)
- 一个或多个更新后的 chunk (JavaScript)

manifest 包括新的编译 hash 和所有的待更新 chunk 目录。每个更新 chunk 都含有对应于此 chunk 的全部更新模块（或一个 flag 用于表明此模块要被移除）的代码。

编译器确保模块 ID 和 chunk ID 在这些构建之间保持一致。通常将这些 ID 存储在内存中（例如，使用 webpack-dev-server 时），但是也可能将它们存储在一个 JSON 文件中。

#### 在模块中

HMR 是可选功能，只会影响包含 HMR 代码的模块。举个例子，通过 style-loader 为 style 样式追加补丁。为了运行追加补丁，style-loader 实现了 HMR 接口；当它通过 HMR 接收到更新，它会使用新的样式替换旧的样式。
类似的，当在一个模块中实现了 HMR 接口，你可以描述出当模块被更新后发生了什么。然而在多数情况下，不需要强制在每个模块中写入 HMR 代码。如果一个模块没有 HMR 处理函数，更新就会冒泡(bubble up)。这意味着一个简单的处理函数能够对整个模块树(complete module tree)进行更新。如果在这个模块树中，一个单独的模块被更新，那么整组依赖模块都会被重新加载。
