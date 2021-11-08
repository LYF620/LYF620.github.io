---
title: Mobx—工作时间减半，快乐加倍！
date: 2021-04-27 10:00
top: false
cover: true
toc: true
mathjax: true
password:
summary: 状态管理
tags:
  - Mobx
  - 状态机
  - 快乐星球
categories: Mobx
img: '/medias/featureimages/7.jpg'
sitemap: true
---

# 什么是 Mobx

MobX 通过透明的函数响应式编程(transparently applying functional reactive programming - TFRP)使得状态管理变得简单和可扩展。他的响应原则是：

> 任何源自应用状态的东西都应该自动地获得。

![Eric 真帅!](/meme/mobx-flow.png)

React 结合 Mobx 开发的话，个人感觉相比于 Redux 来说，清爽了很多。React 通过提供机制把应用状态转换为可渲染组件树并对其进行渲染。而 MobX 提供机制来存储和更新应用状态供 React 使用。对于应用开发中的常见问题，React 和 MobX 都提供了最优和独特的解决方案。React 提供了优化 UI 渲染的机制， 这种机制就是通过使用虚拟 DOM 来减少昂贵的 DOM 变化的数量。MobX 提供了优化应用状态与 React 组件同步的机制，这种机制就是使用响应式虚拟依赖状态图表，它只有在真正需要的时候才更新并且永远保持是最新的。

# 核心概念

## Observable state(可观察的状态)

MobX 为现有的数据结构(如对象，数组和类实例)添加了可观察的功能。
通过使用 @observable 装饰器(ES.Next)来给你的类属性添加注解就可以简单地完成这一切。

```js
import { observable } from 'mobx'

class Todo {
  id = Math.random()
  @observable title = ''
  @observable finished = false
}
```

observable 的对象不仅可以是基本类型，还可以是引用值，比如对象或数组

## Computed values(计算值)

使用 MobX， 你可以定义在相关数据发生变化时自动更新的值。
通过@computed 装饰器或者利用 (extend)Observable 时调用 的 getter / setter 函数来进行使用。

```js
class TodoList {
  @observable todos = []
  @computed get unfinishedTodoCount() {
    return this.todos.filter((todo) => !todo.finished).length
  }
}
```

当添加了一个新的 todo 或者某个 todo 的 finished 属性发生变化时，MobX 会确保 unfinishedTodoCount 自动更新。

## Reactions(自定义反应)

Reactions 和计算值很像，但它不是产生一个新的值，而是会产生一些副作用，比如打印到控制台、网络请求、递增地更新 React 组件树以修补 DOM、等等。 简而言之，reactions 在 响应式编程和命令式编程之间建立沟通的桥梁。

> 自定义 reactions
> 使用 autorun、reaction 和 when 函数即可简单的创建自定义 reactions(autorun、reaction 和 when 可在[官方文档](https://cn.mobx.js.org/refguide/computed-decorator.html 'https://cn.mobx.js.org/refguide/computed-decorator.html')查看)。

```js
autorun(() => {
  console.log('Tasks left: ' + todos.unfinishedTodoCount)
})
```

## React 组件

如果你用 React 的话，可以把你的(无状态函数)组件变成响应式组件，方法是在组件上添加 observer 函数/ 装饰器. observer 由 mobx-react 包提供的。observer 会将 React (函数)组件转换为它们需要渲染的数据的衍生。
使用 MobX 时没有所谓的智能和无脑组件。 所有的组件都会以巧妙的方式进行渲染，而只需要一种简单无脑的方式来定义它们，MobX 会确保组件总是在需要的时重新渲染。

```js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'

@observer
class TodoListView extends Component {
  render() {
    return (
      <div>
        <ul>
          {this.props.todoList.todos.map((todo) => (
            <TodoView todo={todo} key={todo.id} />
          ))}
        </ul>
        Tasks left: {this.props.todoList.unfinishedTodoCount}
      </div>
    )
  }
}

const TodoView = observer(({ todo }) => (
  <li>
    <input
      type="checkbox"
      checked={todo.finished}
      onClick={() => (todo.finished = !todo.finished)}
    />
    {todo.title}
  </li>
))

const store = new TodoList()
ReactDOM.render(
  <TodoListView todoList={store} />,
  document.getElementById('mount')
)
```

## MobX 会对什么作出响应

个人理解是对任何通过 Mobx 函数调用到应用数据（被 observer 的属性）的任何地方，都会做出响应

> MobX 会对在执行跟踪函数期间读取的任何现有的可观察属性做出反应。

- “读取” 是对象属性的间接引用，可以用过 . (例如 user.name) 或者 [] (例如 user['name']) 的形式完成。
- “追踪函数” 是 computed 表达式、observer 组件的 render() 方法和 when、reaction 和 autorun 的第一个入参函数。
- “过程(during)” 意味着只追踪那些在函数执行时被读取的 observable 。这些值是否由追踪函数直接或间接使用并不重要。

换句话说，MobX 不会对其作出反应:

- 从 observable 获取的值，但是在追踪函数之外
- 在异步调用的代码块中读取的 observable

# Mobx 的优势

## 简单且可扩展

MobX 是状态管理库中侵入性最小的之一。这使得 MobX 的方法不但简单，而且可扩展性也非常好:

## 使用类和真正的引用

使用 MobX 不需要使数据标准化。这使得库十分适合那些异常复杂的领域模型
PS：Mobx 以类的方式管理应用数据，方便快捷，易理解易操作，终极轻量香喷喷！

## 保证参照完整性

因为数据不需要标准化，所以 MobX 会自动跟踪状态和衍生之间的关系，你可以免费获得参照完整性。渲染通过三级间接寻址访问的数据？
没有问题，MobX 会跟踪它们，一旦其中一个引用发生了变化，就会重新渲染。作为回报，陈年的老 bug 已不复存在。作为一个程序员，你可能记不住修改的一些数据可能会影响到的某个角落里看起来毫不相关的组件，但 MobX 不会。

## 更简单的 actions 更便于维护

使用 MobX 修改状态是非常简单的。你只需简单的写出你的目的。MobX 会替你处理好剩下的事情。

## 高效的细粒度的可观测性

MobX 会构建应用中所有衍生的图形，以找到保持最新状态所需的重新计算的最少次数。“衍生一切”或许听上去开销很昂贵，但 MobX 构建虚拟衍生图以保持衍生与状态同步所需的重计算的数量最小化。
简单来说，是因为 MobX 会在数据上建立更细粒度的“监听器”，而不是通过程序来控制。
MobX 看到衍生之间的因果关系，因此它可以为衍生排序，使得衍生不会运行多次或引入缺陷
详情可参考[深入剖析 MobX](https://medium.com/hackernoon/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254 'https://medium.com/hackernoon/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254')

## 易操作性

MobX 使用原生 javascript 。由于它的侵入性不强，它可以和绝大部分 javascript 库共同使用，而不需要特定的 MobX 风格库。
所以你可以继续使用你的路由，数据获取和工具库，比如 react-router、 director、 superagent、 lodash，等等。
出于同样的原因，你可以在服务器端和客户端使用它，也可以在 react-native 这样的同构应用中使用。
结论就是: 相比其它状态管理解决方案，当使用 MobX 时通常只需学习更少的新概念。

# 使用 Mobx，工作时间减半，快乐加倍

# 它真的超级简单、超级快！棒极了！千万不要错过！
