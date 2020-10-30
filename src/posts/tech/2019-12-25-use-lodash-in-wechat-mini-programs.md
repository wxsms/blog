---
permalink: '/posts/2019-12-25-use-lodash-in-wechat-mini-programs.html'
title: '在微信小程序中使用 lodash'
date: 2019-12-25T09:44:44.883Z
tags: [JavaScript, WechatMiniProgram]
---

由于微信小程序中的 JavaScript 运行环境与浏览器有些许区别，因此在引用某些 npm lib 时会发生问题。这时候需要对源码做出一些改动。

> 小程序环境比较特殊，一些全局变量（如 window 对象）和构造器（如 Function 构造器）是无法使用的。

在小程序中直接 import [lodash](https://lodash.com/) 会导致以下错误：

```
Uncaught TypeError: Cannot read property 'prototype' of undefined
```

<!-- more -->

解决方案：

1. 安装独立的 lodash method package，如 [lodash.get](https://www.npmjs.com/package/lodash.get)

```
yarn add lodash.get
import get from 'lodash.get'
```

2. 修改 lodash 源码

找到：

```javascript
var root = freeGlobal || freeSelf || Function('return this')();
```

替换为：

```javascript
var root = {
  Array: Array,
  Date: Date,
  Error: Error,
  Function: Function,
  Math: Math,
  Object: Object,
  RegExp: RegExp,
  String: String,
  TypeError: TypeError,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
```
