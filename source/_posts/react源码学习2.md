---
title: React源码学习笔记（二）—— Fiber的心智模型
date: 2021-06-28 10:00
top: false
cover: true
toc: true
mathjax: true
password: Eric_Liu
summary: 'react源码学习'
tags:
  - react
  - react源码
categories: react源码学习
img: '/medias/featureimages/11.jpg'
sitemap: true
---

> 该主题文章仅作为个人学习笔记使用，学习课程为卡颂老师的《自顶向下学习 react 源码》课程
> 教程来源 [《自顶向下学习 react 源码》](https://ke.segmentfault.com/course/1650000023864436)
> 卡颂老师的[开源电子书](https://react.iamkasong.com/)

## Fiber 的心智模型

> React 核心团队成员 [Sebastian Markbåge](https://github.com/sebmarkbage/)（React Hooks 的发明者）曾说：我们在 React 中做的就是践行代数效应（Algebraic Effects）

那么，什么是代数效应呢？

### 代数效应

首先，我们要知道，代数效应目前只是一个学术概念。不像已知的 async 或者 if，function，甚至现在都无法在生产环境中使用。

> 代数效应是函数式编程中的一个概念，用于将副作用从函数调用中分离。

### 那我们为什么要吊他？

React 创造的 Fiber 是基于它的思想，如果你只是用 React，其实完全没有必要去了解这些概念。但也正如同我们正在了解的 Fiber，如果你像我一样对此感到好奇，就请继续读下去吧。

这个名字也许有点吓人，但其实作为前端工作者，只要熟悉 Try/Catch，很快即可弄清代数效应；
先来总结一下 try / catch。假设有一个函数抛出了一个错误，在它和 catch 之间可能隔了一堆函数：

```js
function getName(user) {
  let name = user.name
  if (name === null) {
    throw new Error('A girl has no name')
  }
  return name
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2))
  user2.friendNames.add(getName(user1))
}

const arya = { name: null }
const gendry = { name: 'Gendry' }
try {
  makeFriends(arya, gendry)
} catch (err) {
  console.log("Oops, that didn't work out: ", err)
}
```

我们在 getName 中 throw 一个错误，但它穿过 makeFriends，“冒泡”到了最近的 catch 块。这是 try / catch 的一个重要属性。处于中间的东西不需要关心自身的错误处理。

> 与 C 这类语言中的错误码不同，你不用手动层层传递随时担心弄丢它们，有了 try / catch，错误会自动传递。

### Try/Catch 和代数效应有什么关系呢？

在 Try/Catch 中，一旦我们的函数中存在被 Catch 捕获的错误，我们就会如如 catch 的代码块，无法执行后面的代码。

此时开始宣布 GG，我们只能重新编译运行。但如果有了代数效应，我们可以重新回到原来的地方
![react真有趣！](/shootcut/surprise.png)

这里为了更好的理解代数效应，我们假定一个 JavaScript 语法

> try / handle
>
> ```js
> try{
>  ...
> }handle{
>  ...
> }
> ```
>
> 假定一个**perform**关键字，当我们**perform**一个效应时，JS 引擎在调用堆栈中寻找最近的 try / handle 效应处理。
> 再假定一个**resume with**，在**resume with**的操作下，会返回到我们执行代数效应的地方，并通过这个处理语句传回我们自定义的值

![react真有趣！](/shootcut/example.png)

我们声明一个函数 getName，并在其中使用 perform

```js
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}
```

当 getName 进入 if 的代码块中，会检测到 perform 关键字，随即跳转到 try/handle 代码块

```js
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

完整的代码为：

```js
function getName(user) {
  let name = user.name;
  if (name === null) {
    // 1、我们在这里执行代数效应
  	name = perform 'ask_name';
    // 4. ...最后回到这里（现在 name 是 'Arya Stark'）了
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  // 2、我们进入处理程序（类似try/catch）
  if (effect === 'ask_name') {
    // 3、但我们这里可以带一个值继续执行（与 try/catch 不同!）
  	resume with 'Arya Stark';
  }
}
```

> 在代数效应的机制应该是更清晰一点了。当我们 throw 一个错误，JavaScript 引擎释放堆栈，销毁运行中的局部变量。然而，当我们 perform 一个效应，我们假定的引擎会用余下的函数创建一个回调，然后用 resume with 去调用它。
>
> **再次提醒：具体的语法和关键字是为这篇文章而造的。它们并不是重点，重点是它们阐述的机制。**

代数效应可以作为一种强有力的工具，将代码中的 what 和 how 分开。这让你在写代码时可以关注你在做什么：

```js
function enumerateFiles(dir) { // 枚举文件
  const contents = perform OpenDirectory(dir);
  perform Log('Enumerating files in ', dir);
  for (let file of contents.files) {
  	perform HandleFile(file);
  }
  perform Log('Enumerating subdirectories in ', dir);
  for (let directory of contents.dir) {
    // 递归或调用其他函数时，也可使用 effects。
  	enumerateFiles(directory);
  }
  perform Log('Done');
}
```

随后，将它包在实现了怎么样的块里：

```js
let files = [];
try {
  enumerateFiles('C:\\');
} handle (effect) {
  if (effect instanceof Log) {
  	myLoggingLibrary.log(effect.message);
  	resume;
  } else if (effect instanceof OpenDirectory) {
  	myFileSystemImpl.openDir(effect.dirName, (contents) => {
      resume with contents;
  	});
  } else if (effect instanceof HandleFile) {
    files.push(effect.fileName);
    resume;
  }
}
```

这意味着这些片段甚至可以打包收录起来：

```js
import { withMyLoggingLibrary } from 'my-log'
import { withMyFileSystem } from 'my-fs'

function ourProgram() {
  enumerateFiles('C:\\')
}

withMyLoggingLibrary(() => {
  withMyFileSystem(() => {
    ourProgram()
  })
})
```

不像 async / await 或 Generators，代数效应不会复杂化“中间”的函数。我们的 enumerateFiles 可以在 ourProgram 的深层嵌套中被调用，对每个可能执行的效应，只要上面随便哪里有一个对应的效应处理器，我们的代码就依然有效。

有了效应处理器，我们不用写太多仪式代码或样板代码就能解耦程序逻辑和具体实现。举个例子，在测试中我们可以完全重写行为，用假的文件系统和快照日志来代替将它们输出到控制台：

```js
import { withFakeFileSystem } from 'fake-fs';

function withLogSnapshot(fn) {
  let logs = [];
  try {
  	fn();
  } handle (effect) {
  	if (effect instanceof Log) {
  	  logs.push(effect.message);
  	  resume;
  	}
  }
  // Snapshot emitted logs.
  expect(logs).toMatchSnapshot();
}

test('my program', () => {
  const fakeFiles = [/* ... */];
  withFakeFileSystem(fakeFiles, () => {
  	withLogSnapshot(() => {
	  ourProgram();
  	});
  });
});
```

因为这里没有[“函数颜色”](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)（在其中的代码不必关心效应的影响）且效应处理器是可组合的（你可以嵌套它们），你可以用它们创造极具表现力的抽象。

### 代数效应在 React 中的应用

那么，代数效应与 React 有什么关系呢？最明显的例子就是 hooks

以 useState 为例，我们有没有考虑过 useState 执行时，是如何知晓自己指向的是哪一个组件呢？
这些我们都不需要考虑，React 会为我们处理。我们只需要假设 useState 返回的是我们想要的 state，并编写业务逻辑就行。

```js
function LikeButton() {
  // useState 怎么知道自己在哪一个组件里？
  const [count, setCount] = useState(0)
}
```

> React 对象上有一个叫“当前调度器”的 mutable 状态，指向你正在使用的实现（比如 react-dom 里的实现）。类似的，有一个“当前组件”属性，指向我们 LikeButton 组件的内部数据结构。这就是 useState 如何知道该做什么的答案。
> [setState 如何知道该做什么？](https://overreacted.io/zh-hans/how-does-setstate-know-what-to-do/)清晰的解释了这个问题

### 代数效应与 Generator

从 React15 到 React16，协调器（Reconciler）重构的一大目的是：将老的同步更新的架构变为异步可中断更新。

异步可中断更新可以理解为：更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时恢复之前执行的中间状态。

这就是代数效应中 try...handle 的作用。
其实，浏览器原生就支持类似的实现，这就是 Generator。

但是 Generator 的一些缺陷使 React 团队放弃了他：

- 类似 async，Generator 也是传染性的，使用了 Generator 则上下文的其他函数也需要作出改变。这样心智负担比较重。
- Generator 执行的中间状态是上下文关联的。

参考一下例子

```js
function* doWork(A, B, C) {
  var x = doExpensiveWorkA(A)
  yield
  var y = x + doExpensiveWorkB(B)
  yield
  var z = y + doExpensiveWorkC(C)
  return z
}
```

每当浏览器有空闲时间都会依次执行其中一个 doExpensiveWork，当时间用尽则会中断，当再次恢复时会从中断位置继续执行。

只考虑“单一优先级任务的中断与继续”情况下 Generator 可以很好的实现异步可中断更新。

但是当我们考虑“高优先级任务插队”的情况，如果此时已经完成 doExpensiveWorkA 与 doExpensiveWorkB 计算出 x 与 y。

此时 B 组件接收到一个高优更新，由于 Generator 执行的中间状态是上下文关联的，所以计算 y 时无法复用之前已经计算出的 x，需要重新计算。

如果通过全局变量保存之前执行的中间状态，又会引入新的复杂度。
基于这些原因，React 没有采用 Generator 实现协调器。

### 代数效应与 Fiber

Fiber 并不是计算机术语中的新名词，他的中文翻译叫做纤程，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程。
在很多文章中将纤程理解为协程的一种实现。在 JS 中，协程的实现便是 Generator。
所以，我们可以将纤程(Fiber)、协程(Generator)理解为代数效应思想在 JS 中的体现。

> React Fiber 可以理解为：
> React 内部实现的一套状态更新机制。支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态。
> 其中每个任务更新单元为 React Element 对应的 Fiber 节点。
