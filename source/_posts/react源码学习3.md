---
title: React源码学习笔记（三）—— Fiber的实现原理
date: 2021-06-30 10:00
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
img: '/medias/featureimages/12.jpg'
sitemap: true
---

> 该主题文章仅作为个人学习笔记使用，学习课程为卡颂老师的《自顶向下学习 react 源码》课程
> 教程来源 [《自顶向下学习 react 源码》](https://ke.segmentfault.com/course/1650000023864436)
> 卡颂老师的[开源电子书](https://react.iamkasong.com/)

> 在新的 React 架构一节中，我们提到的虚拟 DOM 在 React 中有个正式的称呼——Fiber。在之后的学习中，我们会逐渐用 Fiber 来取代 React16 虚拟 DOM 这一称呼。

## React 的 Scheduler-Reconciler-Renderer 架构体系

在 React 的 Scheduler-Reconciler-Renderer 架构体系中，我们需要了解以下几个术语：

- Reconciler 工作的阶段被称为 render 阶段。因为在该阶段会调用组件的 render 方法。
- Renderer 工作的阶段被称为 commit 阶段。就像你完成一个需求的编码后执行 git commit 提交代码。commit 阶段会把 render 阶段提交的信息渲染在页面上。
- render 与 commit 阶段统称为 work，即 React 在工作中。相对应的，如果任务正在 Scheduler 内调度，就不属于 work。

## Fiber 的起源

> 最早的 Fiber 官方解释来源于[2016 年 React 团队成员 Acdlite 的一篇介绍](https://github.com/acdlite/react-fiber-architecture)

在 React15 及以前，Reconciler 采用递归的方式创建虚拟 DOM，递归过程是不能中断的。如果组件树的层级很深，递归会占用线程很多时间，造成卡顿。

为了解决这个问题，React16 将递归的无法中断的更新重构为异步的可中断更新，由于曾经用于递归的虚拟 DOM 数据结构已经无法满足需要。于是，全新的 Fiber 架构应运而生。

## Fiber 的含义

Fiber 包含三层含义：

- 作为架构来说，之前 React15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 stack Reconciler。React16 的 Reconciler 基于 Fiber 节点实现，被称为 Fiber Reconciler。
- 作为静态的数据结构来说，每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的 DOM 节点等信息。
- 作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...）。

## Fiber 的结构

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // 作为静态数据结构的属性
  this.tag = tag
  this.key = key
  this.elementType = null
  this.type = null
  this.stateNode = null

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null
  this.child = null
  this.sibling = null
  this.index = 0

  this.ref = null

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps
  this.memoizedProps = null
  this.updateQueue = null
  this.memoizedState = null
  this.dependencies = null

  this.mode = mode

  this.effectTag = NoEffect
  this.nextEffect = null

  this.firstEffect = null
  this.lastEffect = null

  // 调度优先级相关
  this.lanes = NoLanes
  this.childLanes = NoLanes

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null
}
```

### 作为架构来说

每个 Fiber 节点有个对应的 React element，多个 Fiber 节点是如何连接形成树呢？靠如下三个属性：

```js
// 指向父级Fiber节点
this.return = null
// 指向子Fiber节点
this.child = null
// 指向右边第一个兄弟Fiber节点
this.sibling = null
```

举个例子，如下的组件结构：

```js
function App() {
  return (
    <div>
      i am
      <span>KaSong</span>
    </div>
  )
}
```

对应的 Fiber 树结构：
![react真有趣！](/react/fiber.png)

> 这里需要提一下，为什么父级指针叫做 return 而不是 parent 或者 father 呢？因为作为一个工作单元，return 指节点执行完 completeWork（本章后面会介绍）后会返回的下一个节点。子 Fiber 节点及其兄弟节点完成工作后会返回其父级节点，所以用 return 指代父级节点。

### 作为静态的数据结构

```js
// Fiber对应组件的类型 Function/Class/Host...
this.tag = tag
// key属性
this.key = key
// 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
this.elementType = null
// 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
this.type = null
// Fiber对应的真实DOM节点
this.stateNode = null
```

### 作为动态的工作单元

作为动态的工作单元，Fiber 中如下参数保存了本次更新相关的信息，我们会在后续的更新流程中使用到具体属性时再详细介绍

```js
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps
this.memoizedProps = null
this.updateQueue = null
this.memoizedState = null
this.dependencies = null

this.mode = mode

// 保存本次更新会造成的DOM操作
this.effectTag = NoEffect
this.nextEffect = null

this.firstEffect = null
this.lastEffect = null
```

如下两个字段保存调度优先级相关的信息，会在讲解 Scheduler 时介绍。

```js
// 调度优先级相关
this.lanes = NoLanes
this.childLanes = NoLanes
```

> Fiber 节点可以保存对应的 DOM 节点
> Fiber 节点构成的 Fiber 树就对应 DOM 树

### 什么是双缓存

当我们用 canvas 绘制动画，每一帧绘制前都会调用 ctx.clearRect 清除上一帧的画面。

如果当前帧画面计算量比较大，导致清除上一帧画面到绘制当前帧画面之间有较长间隙，就会出现白屏。

为了解决这个问题，我们可以在内存中绘制当前帧动画，绘制完毕后直接用当前帧替换上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。

这种在内存中构建并直接替换的技术叫做双缓存 (opens new window)。

React 使用“双缓存”来完成 Fiber 树的构建与替换——对应着 DOM 树的创建与更新。

### 双缓存 Fiber 树

在 React 中最多会同时存在两棵 Fiber 树。当前屏幕上显示内容对应的 Fiber 树称为 current Fiber 树，正在内存中构建的 Fiber 树称为 workInProgress Fiber 树。

current Fiber 树中的 Fiber 节点被称为 current fiber，workInProgress Fiber 树中的 Fiber 节点被称为 workInProgress fiber，他们通过 alternate 属性连接。

```js
currentFiber.alternate === workInProgressFiber
workInProgressFiber.alternate === currentFiber
```

> 这里可以理解为一个存在两个节点的环形链表

React 应用的根节点通过使 current 指针在不同 Fiber 树的 rootFiber 间切换来完成 current Fiber 树指向的切换。

即当 workInProgress Fiber 树构建完成交给 Renderer 渲染在页面上后，应用根节点的 current 指针指向 workInProgress Fiber 树，此时 workInProgress Fiber 树就变为 current Fiber 树。

每次状态更新都会产生新的 workInProgress Fiber 树，通过 current 与 workInProgress 的替换，完成 DOM 更新。

接下来我们以具体例子讲解 mount 时、update 时的构建/替换流程。

### mount 时

参考以下例子：

```js
function App() {
  const [num, add] = useState(0)
  return <p onClick={() => add(num + 1)}>{num}</p>
}

ReactDOM.render(<App />, document.getElementById('root'))
```

1、首次执行 ReactDOM.render 会创建 fiberRootNode（源码中叫 fiberRoot）和 rootFiber。其中 fiberRootNode 是整个应用的根节点，rootFiber 是<App/>所在组件树的根节点。

> 之所以要区分 fiberRootNode 与 rootFiber，是因为在应用中我们可以多次调用 ReactDOM.render 渲染不同的组件树，他们会拥有不同的 rootFiber。但是整个应用的根节点只有一个，那就是 fiberRootNode。

fiberRootNode 的 current 会指向当前页面上已渲染内容对应 Fiber 树，即 current Fiber 树。
![react真有趣！](/react/rootFiber.png)

```js
fiberRootNode.current = rootFiber
```

由于是首屏渲染，页面中还没有挂载任何 DOM，所以 fiberRootNode.current 指向的 rootFiber 没有任何子 Fiber 节点（即 current Fiber 树为空）。

2、接下来进入 render 阶段，根据组件返回的 JSX 在内存中依次创建 Fiber 节点并连接在一起构建 Fiber 树，被称为 workInProgress Fiber 树。（下图中右侧为内存中构建的树，左侧为页面显示的树）

> 在构建 workInProgress Fiber 树时会尝试复用 current Fiber 树中已有的 Fiber 节点内的属性，在首屏渲染时只有 rootFiber 存在对应的 current fiber（即 rootFiber.alternate）。

![react真有趣！](/react/workInProgressFiber.png)

3、图中右侧已构建完的 workInProgress Fiber 树在 commit 阶段渲染到页面。

> 此时 DOM 更新为右侧树对应的样子。fiberRootNode 的 current 指针指向 workInProgress Fiber 树使其变为 current Fiber 树。

![react真有趣！](/react/wipTreeFinish.png)

### Update 时

1、接下来我们点击 p 节点触发状态改变，这会开启一次新的 render 阶段并构建一棵新的 workInProgress Fiber 树。
![react真有趣！](/react/wipTreeUpdate.png)

> 和 mount 时一样，workInProgress fiber 的创建可以复用 current Fiber 树对应的节点数据。
> 这个决定是否复用的过程就是 Diff 算法，后面章节会详细讲解

2、workInProgress Fiber 树在 render 阶段完成构建后进入 commit 阶段渲染到页面上。渲染完毕后，workInProgress Fiber 树变为 current Fiber 树。
![react真有趣！](/react/currentTreeUpdate.png)
