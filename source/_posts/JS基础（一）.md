---
title: JS基础（一）
date: 2021-03-10 19:17:12
mathjax: true
password:
summary: "回顾JS"
tags:
  - JS基础
categories:
img: "/medias/featureimages/2.jpg"
sitemap: true
---

## JS 内置类型

- JS 分为七中内置类型，又分为量大类型：基本类型和对象
- 基本类型：String、Number、Boolean、Null、Undefined、Symbol
- 引用数据类型：Object、Function、Array
- 其中 JS 的数字类型是浮点类型，没有整型（这也就是为什么常说的 JS 中 0.1+0.2!=0.3）,并且浮点类型基于 IEEE754 标准实现，在使用中会遇到某些 bug。其次，NaN 也属于 number 类型，并且 NaN 不等于自身
- 对于基本类型来说，如果使用字面量的方式，那么这个变量值只是字面量，只有在必要时才会转换为对应的类型。

```js
let a = 111; // 此时a只是一个字面量，并不是number类型
a.toString(); // 使用时候才会转换为对象类型
```

> 对象（Object）是引用类型，在使用过程中会遇到深浅拷贝的问题

```js
//浅拷贝
let a = { name: "FE" }; // 此时a只是一个字面量，并不是number类型
let a = b;
b.name = "EF";
console.log(a.name); // EF
```

JS 原生不支持深拷贝，object.asign 和{...obj}都属于浅拷贝

> JSON.parse(JSON.stringify())
>
> > 这是 JS 实现深拷贝最简单的方法，原理就是先将对象转换为 JSON 字符串，再通过 JSON.parse 重现构建对象，但是这种方法的缺点如下：

- 不能复制 function、正则、Symbol，会忽略 undefined 和 symbol

```js
let a = {
  reg: /^asd$/,
  age: undefined,
  sex: Symbol("male"),
  jobs: function () {},
  name: "yck",
};
let b = JSON.parse(JSON.stringify(a));
console.log(b); // {name: "yck"，reg : {}}
```

- 循环引用会报错
  如果在 JSON.stringify 中传入一个循环引用的对象，那么会直接报错：
  ![Eric 真帅!](/meme/error.jpg)

- 不能序列化函数
- 相同的引用会被重复复制

```js
let obj = {name;'object'}
let obj2 = {name:'aaaaaa'}
let obj3 = {name:'bbbbbb'}
obj.t1 = obj2
obj.t2 = obj3
let cp = JSON.parse(JSON.stringify(obj));
obj.ttt1.name = 'change'
cp.ttt1.name  = 'change'
console.log(obj,cp);
```

![Eric 真帅!](/meme/obj.jpg)

```js
//深拷贝
let b = JSON.parse(JSON.stringify(a));
```

> > 递归实现 JS 深拷贝：思想非常简单，对于简单类型，直接复制。对于引用类型，递归复制它的每一个属性。
> > 需要解决的问题：

- 循环引用
- 相同引用
- 不同的类型

```js
function deepCopy(target) {
  let copyed_objs = []; //此数组解决了循环引用和相同引用的问题，它存放已经递归到的目标对象
  function _deepCopy(target) {
    if (typeof target !== "object" || !target) {
      return target;
    }
    for (let i = 0; i < copyed_objs.length; i++) {
      if (copyed_objs[i].target === target) {
        return copyed_objs[i].copyTarget;
      }
    }
    let obj = {};
    if (Array.isArray(target)) {
      obj = []; //处理target是数组的情况
    }
    copyed_objs.push({ target: target, copyTarget: obj });
    Object.keys(target).forEach((key) => {
      if (obj[key]) {
        return;
      }
      obj[key] = _deepCopy(target[key]);
    });
    return obj;
  }
  return _deepCopy(target);
}
```

copyed_objs 这个数组存放的是已经递归过的目标对象。在递归一个目标对象之前，我们应该检查这个数组，如果当前目标对象和 copyed_objs 中的某个对象相等，那么不对其递归。

## Typeof

> typeof 对于基本类型，除了 null 都可以显示正确的类型

```js
typeof 1; //'number'
typeof "1"; //'string'
typeof undefined; //'undefined'
typeof true; //'boolean'
typeof symbol(); //'symbol'
typeof b; //'undefined'
```

> typeof 对于对象，除了函数都会显示 object

```js
typeof []; //'object'
typeof {}; //'object'
typeof console.log(); //'function'
```

> 对于 null 来说，虽然他是基本类型，但是会显示 object

```js
typeof null; //'object'
```

> PS：为什么会出现这种情况呢？因为在 JS 的最初版本中，使用的是 32 位系统，为了性能考虑使用低位存储了变量的类型信息，000 开头代表是对象，然而 null 表示为全零，所以将它错误的判断为 object 。虽然现在的内部类型判断代码已经改变了，但是对于这个 Bug 却是一直流传下来。

- 如果我们想获得一个变量的正确类型，可以通过 Object.prototype.toString.call(xx)。这样我们就可以获得类似 [object Type] 的字符串

```js
let a;
// 我们也可以这样判断 undefined
a === undefined;
// 但是 undefined 不是保留字，能够在低版本浏览器被赋值
let undefined = 1;
// 这样判断就会出错
// 所以可以用下面的方式来判断，并且代码量更少
// 因为 void 后面随便跟上一个组成表达式
// 返回就是 undefined
a === void 0;
```

> null 和 undefined 的区别
>
> > null 表示“没有对象”，即此处不应该有值

    典型用法：
        （1）作为函数的参数，表示该函数的参数不是对象
        （2）作为对象原型链的终点

eg：Object.getPrototypeOf(Object.prototype)

undefined 表示“缺少值”，就是此处应该有一个值，但是还没有定义
典型用法：
（1）变量被声明了，但没有赋值时，就等于 undefined
（2）调用函数时，应该提供的参数没有提供，该参数等于 undefined
（3）对象没有赋值的属性，该属性的值为 undefined
（4）函数没有返回值时，默认返回 undefined

```js
ar i;
i // undefined

function f(x){console.log(x)}
f() // undefined

var  o = new Object();
o.p // undefined

var x = f();
x // undefined
```

送大家一张图，便于记忆：
![Eric 真帅!](/meme/type.jpg)

## 类型转换

### 转 Boolean

> 在条件判断时，除了 undefined，null，false，NaN，''，0，-0，其他所有值都转为 true，包括所有对象

### 对象转基本类型

> 对象在转换基本类型时，首先会调用 valueOf 然后调用 toString。并且这两个方法你是可以重写的

```js
const obj = {
  valueOf() {
    return "";
  },
};
```

### 四则运算符

> 只有当加法运算时，其中一方是字符串类型，就会把另一个也转为字符串类型。其他运算只要其中一方是数字，那另一方就转为数字。并且加法运算会触发三种类型转换：将值转换为原始值，转换为数字，转换为字符串

```js
1 + '1' // '11'
2 * '2' // 4
[1,2] + [2,1] // '1,22,1'
[1,2].toString() -> '1,2'
'1,2' + '2,1' = '1,22,1'
```

> 对于加号需要注意这个表达式 'a' ++ 'b'

```js
'a' ++ 'b' // ->'aNaN'
//因为+'b' -> NaN
+ '1' // -> 1
```

### ==操作符

> 为什么[]==![] // -> true

```js
//[]转成true，然后取反边变成false
[] == false
//然后
[] == ToNumber(false)
[] == 0
//然后
ToPrimitive([]) == 0
// [].toString() -> ''
'' == 0
```

### 比较运算符

- 如果是对象，就通过 toPrimitive 转换对象
- 如果是字符串，就通过 unicode 字符索引来比较

## 原型

- 每个函数都有 prototype 属性，除了 Function.prototype.bind(),该属性指向原型
- 每个对象都有*proto*属性,指向了创建该对象的构造函数的原型。其实这个属性指向了[[prototype]]，但是[[prototype]]是内部属性，我们并不能访问到，所以使用*proto*来访问
- 对象可以通过*proto*来寻找不属于该对象的属性，*proto*将对象连接起来组成了原型链
