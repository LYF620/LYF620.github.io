---
title: React源码学习笔记（一）—— React理念
date: 2021-06-25 10:00
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
img: '/medias/featureimages/9.jpg'
sitemap: true
---

> 该主题文章仅作为个人学习笔记使用，学习课程为卡颂老师的《自顶向下学习 react 源码》课程
> 教程来源 [《自顶向下学习 react 源码》](https://ke.segmentfault.com/course/1650000023864436)
> 卡颂老师的[开源电子书](https://react.iamkasong.com/)

## react 的设计理念

> **react 设计理念：**react 作为一个 **UI 库**，旨在于使用 JavaScript 构建**快速响应**的大型 Web 程序

相信作为前端工作者，大家都会遇到过自己开发的页面组件白屏，渲染过程卡顿、掉帧的情况（尤其是在 PC 机器性能堪忧的情况下）；或是前端的 webpack 编译效率低下。热更新失效，更新过程缓慢；亦或是在处理网络请求渲染数据时出现明显的卡顿情况，无法平滑过度。

这些情况基本可以概括于：

- 机器 CPU 的瓶颈 => 计算能力
- IO 传输的瓶颈 => 网络延迟

### 如何解决 CPU 瓶颈

首先，我们来说一下网页掉帧、卡顿的原因
在当前主流浏览器下，默认的刷新频率为 60Hz，即刷新效率为（1000ms / 60Hz）16.6ms/次

> PS： windows 对象的**window.requestAnimationFrame**，使用该 APi 生成的动画刷新频率即为 60Hz

浏览器在这 16.6ms 的时间内，需要完成一下工作

> JS 脚本执行 ----- 样式布局 ---- 样式绘制
>
> > JS 可以操作 DOM，但是 GUI 渲染线程和 JS 线程是互斥的，所以 JS 脚本执行和浏览器布局、绘制是不能同时执行的

CPU 瓶颈的原因：

当 JS 执行时间过长，超出了 16.6ms，这次刷新就没有时间执行样式布局和样式绘制了。一旦渲染开始，就不能被终止。因此浏览器不能在按键结束后立即更新。无论 UI 库(如 React)在基准测试中表现得多么出色，只要它使用阻塞渲染，组件中总会有一定数量的工作导致卡顿。并且，通常没有简单的解决办法。

如何解决这个问题呢？

答案是：在浏览器每一帧的时间中，预留一些时间给 JS 线程，React 利用这部分时间更新组件（可以看到，在[源码](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/scheduler/src/forks/SchedulerHostConfig.default.js#L119) 中，预留的初始时间是 5ms）。

**当预留的时间不够用时，React 将线程控制权交还给浏览器使其有时间渲染 UI，React 则等待下一帧时间到来继续被中断的工作**

接下来我们开启 [Concurrent Mode](https://zh-hans.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects)（后续会讲到，现在只需了解开启后会启用时间切片，即 react 中的新概念 Fiber 实现机制）：

> Concurrent Mode: (默认情况下未启用) 将渲染工作分解为多个部分，对任务进行暂停和恢复操作以避免阻塞浏览器。这意味着 React 可以在提交之前多次调用渲染阶段生命周期的方法，或者在不提交的情况下调用它们（由于出现错误或更高优先级的任务使其中断）。

> 这种将长任务分拆到每一帧中，像蚂蚁搬家一样一次执行一小段任务的操作，被称为时间切片（time slice）

```js
// 通过使用ReactDOM.unstable_createRoot开启Concurrent Mode
// ReactDOM.render(<App/>, rootEl);
ReactDOM.unstable_createRoot(rootEl).render(<App />)
```

开启该模式后，我们 JS 中的的长任务会被拆分到每一帧中不同的 task，JS 执行时间大致会固定在在 5ms 左右，为浏览器执行**样式布局**和样式绘制预留时间，减少掉帧的可能性。

所以，解决 CPU 瓶颈的关键是实现时间切片，而时间切片的关键是：将同步的更新变为可中断的异步更新。

### IO 的瓶颈

网络延迟是开发者无法决定的。那如何在网络延迟客观存在的情况下，减少用户对网络延迟的感知？
React 给出的答案是[将人机交互研究的结果整合到真实的 UI 中](https://zh-hans.reactjs.org/docs/concurrent-mode-intro.html#putting-research-into-production)

由此可见，React 为了践行“**快速响应**的大型 Web 应用程序”理念做出的努力。其关键在于解决**CPU 和 IO 的瓶颈**。而落到实现上，则需要**将同步的更新变为可中断的异步更新**。

### React 的架构变更历程

React 在 v15 版本升级到 v16 的过程中，为了践行快速响应这一需求，重构了整个 React 的架构。我们可以参考 v15 版本，看一下为什么老版本无法实现快速响应的需求，以至于被重构。

### React v15 架构

React15 的架构可以分为两层：

- Reconclier —— 协调器，负责找出变化的组件（Diff 算法就在这里进行运作）
- Renderer —— 渲染器，负责将变化的组件渲染到页面上

在每次更新发生时，Renderer 接到 Reconciler 通知，将变化的组件渲染在当前宿主环境。

![react真有趣！](/react/react15.png)

> **Reconclier（协调器）**
> 在 React 中，我们可以通过 this.setState、this.forceUpdate、ReactDOM.render 等 API 触发更新。
> 每当更新触发时，协调器会做以下工作：
>
> - 调用组件的 render 方法，将返回的 JSX 转化为虚拟 DOM
> - 将虚拟 DOM 和上次更新时的虚拟 DOM 对比（DIFF 算法）
> - 通过对比找出发生变化的虚拟 DOM
> - 通过 Renderer 将变化的虚拟 DOM 渲染到页面上
>   [官方的 Reconclier 解释](https://zh-hans.reactjs.org/docs/codebase-overview.html#reconcilers)

> **Renderer（渲染器）**
> 在 React 中，根据不同平台存在不同的 Renderer，主流的渲染器主要如下：
>
> - ReactDOM，渲染浏览器组件
> - ReactNative，渲染原生 APP 组件
> - ReactTest，渲染出纯 JS 对象用于测试（以 Jest 为主）
> - ReactArt，渲染 Canvas、SVG

**React15 的缺点：**
在 Reconciler 中，mount 的组件会调用 mountComponent (opens new window)，update 的组件会调用 updateComponent (opens new window)。这两个方法都会通过 [Stack Reconciler](https://zh-hans.reactjs.org/docs/implementation-notes.html) 递归更新子组件。

这里就会导致一个问题，在递归更新的过程中是无法被终端的。当我们的一个更新过程如果超过浏览器刷新时间（16ms）,用户交互就会出现卡顿，掉帧的情况。在上文中，我们提出为了解决这种问题，实现可终端的异步更新代替同步更新。那么 React15 是否支持异步更新呢？

结合[这里的 Demo](https://codesandbox.io/s/fervent-sutherland-pf7sg?file=/src/App.js)进行测试

![react真有趣！](/react/react15Demo.png)

在这里，我们可以看到 React15 中，Reconciler 和 Renderer 是交替工作的。当第一个 li 在页面上发生变化后，第二个 li 再进入 Reconciler。
由于整个过程都是同步的，所以在用户看来所有 DOM 是同时更新的。
接下来，让我们模拟一下，如果中途中断更新会怎么样？

> **注意**
> 以下是我们模拟中断的情况，实际上 React15 并不会中断进行中的更新

![react真有趣！](/react/react15Demointurpt.png)

当第一个 li 完成更新时中断更新，即步骤 3 完成后中断更新，此时后面的步骤都还未执行。

用户本来期望 123 变为 246。实际却看见更新不完全的 DOM！（即 223）

基于这个原因，React 决定重写整个架构。

### React16 架构

React15 的架构可以分为三层：

- Scheduler—— 调度器，调度任务的优先级，高优任务优先进入 Reconciler
- Reconclier —— 协调器，负责找出变化的组件（Diff 算法就在这里进行运作）
- Renderer —— 渲染器，负责将变化的组件渲染到页面上

![react真有趣！](/react/react16.gif)

由于调度器和协调器的工作发生在内存中，不会执行具体的视图操作，所以即使被中断，用户也不会看到未完成的视图

> **Scheduler（调度器）**
> 既然我们以浏览器是否有剩余时间作为任务中断的标准，那么我们需要一种机制，当浏览器有剩余时间时通知我们。
> 其实部分浏览器已经实现了这个 API，这就是 requestIdleCallback (opens new window)。但是由于以下因素，React 放弃使用：
>
> - 浏览器兼容性
> - 触发频率不稳定，受很多因素影响。比如当我们的浏览器切换 tab 后，之前 tab 注册的 requestIdleCallback 触发的频率会变得很低

基于以上原因，React 实现了功能更完备的 requestIdleCallbackpolyfill，这就是 Scheduler。除了在空闲时触发回调的功能外，Scheduler 还提供了多种调度优先级供任务设置。

> [Scheduler](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/scheduler/README.md)是独立于 React 的库

> **Reconciler（协调器）**
> 我们知道，在 React15 中 Reconciler 是递归处理虚拟 DOM 的。让我们看看 React16 的 [Reconciler](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1673)
> 我们可以看见，更新工作从递归变成了可以中断的循环过程。每次循环都会调用 shouldYield 判断当前是否有剩余时间。
>
> ```js
> /** @noinline */
> function workLoopConcurrent() {
>   // Perform work until Scheduler asks us to yield
>   while (workInProgress !== null && !shouldYield()) {
>     workInProgress = performUnitOfWork(workInProgress)
>   }
> }
> ```

那么 React16 是如何解决中断更新时 DOM 渲染不完全的问题呢？
在 React16 中，Reconciler 与 Renderer 不再是交替工作。当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上代表增/删/更新的标记，类似这样：

在 React16 中，Reconciler 与 Renderer 不再是交替工作。当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上代表增/删/更新的标记，类似这样：

```js
export const Placement = /*             */ 0b0000000000010
export const Update = /*                */ 0b0000000000100
export const PlacementAndUpdate = /*    */ 0b0000000000110
export const Deletion = /*              */ 0b0000000001000
```

> 整个 Scheduler 与 Reconciler 的工作都在内存中进行。只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。
> [官方对于 React16 新 Reonciler 的解释](https://zh-hans.reactjs.org/docs/codebase-overview.html#fiber-reconciler)
> 它的主要目标是：
>
> - 能够把可中断的任务切片处理。
> - 能够调整优先级，重置并复用任务。
> - 能够在父元素与子元素之间交错处理，以支持 React 中的布局。
> - 能够在 render() 中返回多个元素。
> - 更好地支持错误边界。

> **Renderer（渲染器）**
> Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。
> 对于我们在上一节使用过的 Demo,在 React16 架构中整个更新流程为：

![react真有趣！](/react/react16Demo.png)

其中红框中的步骤随时可能由于以下原因被中断：

- 有其他更高优任务需要先更新
- 当前帧没有剩余时间

> 由于红框中的工作都在内存中进行，不会更新页面上的 DOM，所以即使反复中断，用户也不会看见更新不完全的 DOM（即上一节演示的情况）。
