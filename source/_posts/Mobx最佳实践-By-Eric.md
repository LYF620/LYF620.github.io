---
title: Mobx最佳实践-By Eric
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
categories:
img: "/medias/featureimages/8.jpg"
sitemap: true
---

# 代码最佳实践（个人）

> PS:以下内容均以 react 作为实践

- ES6 的 class 封装
- 第三方库 mobx-react-lite
- 第三方库和 class 封装结合

## ES6 的 class 封装

```ts
// 用class使用mobx
import { observable, action, runInAction } from "mobx";

// 声明被observer的属性
export class BaseItem {
  @observable id: string;
  @observable name: string;
}

export class Item extends BaseItem {
  // 将属性传给构造函数
  constructor(props?: Partial<BaseItem>) {
    super();

    if (props) {
      this.update(props);
    }
  }

  // 使用mobx内置函数action修改更新状态
  @action
  update(props: Partial<BaseItem>) {
    Object.assign(this, props);
  }

  // 根据业务fetch数据，更新给observer状态
  fetch = async () => {
    //mock数据
    const data = {
      id: "1",
      name: "eric",
    };

    // runInAction 工具函数,将‘“最终的”修改放入一个异步动作中
    runInAction(() => {
      this.update(data);
    });
  };
}
```

这样一个 mobx 类就声明好了，在使用时，我们只需要这样：

```js
import { Item } from "./item";
// mobx类实例化
const item = new Item();
// 获取数据
item.fetch();
```

再这样直接使用就可以啦：

```js
const demo = () => {
  return
  <div>我是{item.name}<div>
}
```

当然这时最简单的模式啦，一般我们在 react 中的数据不会是这么简单的对吧？比如对象、数组，在这里我以表格数据为例，示范以下 mobx 类是如何实现对表格数据进行管理的
假设我们需要管理的数据类型是这样的：

```js
//表格的用户信息
interface User{
  id:string
  name:string
}

//表格的分页信息
interface Page{
  page_size:number,
  page_index:number
}

//表格主体内容
interface UserGroup {
  list:item[]
  total:number
  page:Page
}
```

这样的话，我们可以先这样：

```js
//像上面的例子一样，先创建class Item 管理list中每一项
import { observable, action, runInAction } from "mobx";

export class BaseItem {
  @observable id: string;
  @observable name: string;
}

export class Item extends BaseItem {
  constructor(props?: Partial<BaseItem>) {
    super();

    if (props) {
      this.update(props);
    }
  }

  @action
  update(props: Partial<BaseItem>) {
    Object.assign(this, props);
  }

  fetch = async () => {
    //mock数据
    const data = {
      id: "1",
      name: "eric",
    };

    runInAction(() => {
      this.update(data);
    });
  };
}
```

再这样：

```js
//创建管理list的mobx类
import { observable, action, runInAction } from 'mobx'
import { Item, BaseItem } from './Item'

export class BaseModel {
  @observable list: Item[] = []
  @observable page_ctx: {
    index: number
    size: number
  } = {
    index: 1,
    size: 10,
  }
  @observable total:number
}

type IRequest = Omit<BaseModel, 'list'> & {
  list: BaseItem[]
}

export type FetchParams = {
  page_index: number
  page_size: number
}

export class Model extends BaseModel {
  @action
  update({ list, ...props }: Partial<IRequest>) {
    Object.assign(this, props)

    //更新数据时，list存在时遍历数组，为数组每一项生成对应的item实例
    if (list) {
      this.list = list.map(item => new Item(item))
    }
  }

  //请求数据
  fetch = async ({ key, page_index, page_size }: FetchParams) => {
    const data = await http.post('/test')

    //更新数据
    runInAction(() => {
      this.update(data)
    })
  }
}
```

这里是对获取到的表格数据的每一项都针对性的使用 mobx 管理起来，对于需要数据响应的表格还是很有效果的。并且 mobx 会自动跟踪状态和衍生之间的关系，你可以免费获得参照完整性。

> mobx 类可以作为 react 项目的全局属性使用，也可在组件内部作为私有属性使用

## 第三方库 mobx-react-lite

详细使用方式可以看看这个[npm mobx-react-lite](https://www.npmjs.com/package/mobx-react-lite "https://www.npmjs.com/package/mobx-react-lite")

这里我们使用该库的 useLocalStore 作为页面级别的状态管理

```js
useLocalStore<T, S>(initializer: () => T, source?: S): T (deprecated)
```

这里贴一个简单例子：

```js
function Measurement({ unit }) {
  const state = useLocalObservable(() => ({
    unit, // 属性初始化
    // unit的set方法
    setUnit(val) {
      this.unit = val;
    },
    length: 0,
    // 这里的值类似于mobx的computed值，即在相关数据发生变化时自动更新的值
    get lengthWithUnit() {
      //get方法必须拥有返回值
      return this.unit === "inch"
        ? `${this.length * 2.54} inch`
        : `${this.length} cm`;
    },
  }));

  useEffect(() => {
    state.unit = unit;
  }, [unit]);

  return <h1>{state.lengthWithUnit}</h1>;
}
```

## 第三方库和 class 封装结合

这里的使用场景为：

- mobx 类用来管理前端所需数据响应
- useLocalStore 用来作为该 pages 页面的管理（一个父组件，多个子组件）

文件目录：

- TestPage
  - store
    状态管理模块
    - Model
      数据状态管理（mobx 类）
      - index.ts
      - item.ts
    - index.ts
      页面状态管理
  - component1.tsx
  - component2.tsx
  - index.tsx

这里使用 react 的 context 组件，为整个 TestPage 提供全局数据；全局数据即为 mobx-react-lite 的 useLoaclStore。意思就是通过 context 的形式，为整个 Testpage 提供一个状态管理

先提供一个创建 context 的工厂函数，该工程提供 Provider,context,以及一个 useContext 的方法

```js
import React, { createContext, useContext } from 'react'

export function createStore<T extends (...args: any) => any>(
  useExternalStore: T
) {
  const Context = createContext<ReturnType<T>>(null)
  function Provider({ children }) {
    const store = useExternalStore()
    return <Context.Provider value={store}>{children}</Context.Provider>
  }

  return {
    Provider,
    Context,
    useStore: function useStore() {
      return useContext(Context)
    },
  }
}
```
