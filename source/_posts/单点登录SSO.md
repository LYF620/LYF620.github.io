---
title: 单点登录SSO
date: 2021-03-16 19:17:12
mathjax: true
password:
summary: "单点登录SSO"
tags:
  - 单点登录SSO
  - CAS
categories:
img: "/meme/sso.png"
---

## 什么是 单点登录

单点登录旨在为多款产品提供一套且唯一的登录系统，即在多个应用系统中，只需要登录一次，就可以访问其他相互信任的应用系统

> 单点登录全称 Single Sign On，以下统一简称为 SSO

> ![Eric 真帅!](/meme/sso.png)
> 如图所示，分别有三个应用和 sso 服务器。三个应用都没有登录模块，而 SSO 只有登录模块，没有其他的业务模块。当三个应用需要登录时，将跳转到 SSO 系统，SSO 系统完成登录验证之后，其他的应用系统也就随之登录了。

## 普通的登录验证机制

在开始介绍单点登录验证之前，我们先看一下普通的登录机制：
![Eric 真帅!](/meme/login.png)

如图所示，我们在浏览器访问一个应用，该应用需要登录，需要在输入用户名密码后，发送请求到服务端完成验证。这时，我们的服务端该用户的 session 标记登录为已登录状态。同时也会在浏览器中写入 cookie，这个 cookie 是该用户在服务端的唯一标识。下次我们再访问该应用时，浏览器检测 cookie，如未过期，请求中会携带着这个 cookie，服务端会根据这个 cookie 寻找对应的 session，通过 session 来判断该用户是否完成登录，如不做特殊配置，这个 cookie 的名字我们一般命名为 session-id，且在服务端对应唯一的 session
下面我们开始了解 SSO

## 同域名下的 SSO

在企业的场景下，大多数情况都是多个产品使用同一个域名，只不过是通过二级域名区分不同的系统。比如我们有个域名叫：eric.com，同时有两个业务产品分别为：APP1.eric.com 和 APP2.eric.com,而我们的单点登录系统域名则为：sso.eric.com

在单点登录系统下，我们只要在 sso.eric.com 上登录验证成功，那我们在 APP1.eric.com 和 APP2.eric.com 上也就登录了。为了实现这个目的，我们应该如何操作呢？也就是当我们在 sso.eric.com 上登录了，sso 的服务端记录了我们的 session（已登录状态），这时如何才能让我们在访问 APP1.eric.com 和 APP2.eric.com 实现登录呢？
在实现单点登录系统之前，我们需要知道：

> - cookie 是不能跨域的，我们的 cookie 的 domain 属性属于 sso.eric.com，在给 APP1.eric.com 和 APP2.eric.com 发送请求是带不上的
> - sso、APP1 和 APP2 是不同的应用，他们的 session 存在自己的服务端内，是不共享的

那么我们如何解决这两个问题呢？我们先看图
![Eric 真帅!](/meme/sameSSO.png)

cookie 问题：我们在 sso 登录以后，可以将 cookie 的域（domain）设置为顶域，即 eric.com，这样我们所有的子域系统都可以访问到顶域的 cookie（我们在设置 cookie 时，只能设置顶域和自己的域，不能设置其他的域，比如：我们不能再自己的系统中给 baidu.com 的域设置 cookie）。

session 问题：我们在 sso 登录以后，这时再访问 APP2、APP1，cookie 也会对应的带到应用下的服务端。那么服务端如何找到这个 cookie 对应的 session 呢？这里就需要将三个系统的 session 共享。

> session 共享：通用的 redis、etcd、postgres 均可

当然这不是完整的单点登录，但是这个方案可以在要求不是很高的情况下满足需求

## 不同域名下的 SSO

同一域名下使用 cookie 顶域以及共享 session 解决了 SSO 的需求，但是如果实在不同域下呢？不同域之间的 cookie 和 session 是不共享的，难道我们还要在不同域名下的服务再做一次通信？
这里我们就可以采用 CAS 流程了，这个流程是单点登录的标准流程，老规矩，先看图
![Eric 真帅!](/meme/SSO1.png)

该图的流程描述的是用户第一次登录的情况：

- 用户访问 APP1 系统，APP1 是需要登录的，而此时用户并没有登录
- 直接重定向到 CAS 系统（SSO 系统）。而此时 SSO 系统也没有登录，SSO 弹出用户登录页
- 用户填写用户名密码，发送请求到 SSO 服务器验证后，在该服务器写入该用户登录状态（已登录）的 session，browser 中写入 sso 域下的 cookie
- SSO 系统登录完成后会生成一个 ST（Service Ticket），然后跳转到 APP1 系统，同时将 ST 作为参数传递给 APP1 系统
- APP1 系统拿到 ST 后，从后台向 SSO 发送请求，验证 ST 是否有效
- 验证通过后，APP 系统将登录状态写入 session 并设置 APP1 域下的 cookie
  至此，单点登录就算完成了，以后我们再访问 APP1 系统时，APP1 就是登录的
  ![Eric 真帅!](/meme/SSO2.png)

现在我们来看看用户登录 APP1 后，访问 APP2 的情况：

- 用户访问 APP2 系统，APP2 没有登录，跳转到 SSO
- 而此时 SSO 系统已经登录了，不需要重新登录验证
- SSO 生成 ST，浏览器跳转到 APP2 系统，并将 ST 作为参数传递给 APP2
- APP2 拿到 ST 后，后台访问 SSO，验证 ST 是否有效
- 验证通过后，APP2 系统将登录状态写入 session 并设置 APP2 域下的 cookie
