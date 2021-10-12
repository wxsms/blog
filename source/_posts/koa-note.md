---

title: 'Koa Note'
date: 2017-07-07 16:11:00
sidebar: false
categories:
  - JavaScript
tags:
  - Koa
  - NodeJs
---

> Koa是一个类似于 Express 的 Web 开发框架，创始人也是同一个人。它的主要特点是，使用了 ES6 的 Generator 函数，进行了架构的重新设计。也就是说，Koa的原理和内部结构很像 Express，但是语法和内部结构进行了升级。
> 
> —— <cite>阮一峰博客</cite>

**想要达到使用 Koa2 的完整体验，需要将 Node 版本升级到 v7.6+ 以支持 async 语法。**

**为什么是 Koa 而不是 Express 4.0？**

因为 Generator 带来的改动太大了，相当于推倒重来。

**以下内容基于 Koa2**

<!-- more -->

## 应用

一个 Koa Application（以下简称 app）由一系列 generator 中间件组成。按照编码顺序在栈内依次执行，从这个角度来看，Koa app 和其他中间件系统（比如 Ruby Rack 或者 Connect / Express ）没有什么太大差别。

简单的 Hello World 应用程序:

```javascript
const Koa = require('koa');
const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);
```

## 级联代码

Koa 中间件以一种非常传统的方式级联起来。

在以往的 Node 开发中，频繁使用回调不太便于展示复杂的代码逻辑，在 Koa 中，我们可以写出真正具有表现力的中间件。与 Connect 实现中间件的方法相对比，Koa 的做法不是简单的将控制权依次移交给一个又一个的中间件直到程序结束，而有点像“穿越一只洋葱”。

![图示 Koa 中间件级联](https://camo.githubusercontent.com/d80cf3b511ef4898bcde9a464de491fa15a50d06/68747470733a2f2f7261772e6769746875622e636f6d2f66656e676d6b322f6b6f612d67756964652f6d61737465722f6f6e696f6e2e706e67)

下边这个例子展现了使用这一特殊方法书写的 Hello World 范例。

```javascript
const Koa = require('koa');
const app = new Koa();

// x-response-time
app.use(async function (ctx, next) {
  // (1) 进入路由
  const start = new Date();
  await next();
  // (5) 再次进入 x-response-time 中间件，记录2次通过此中间件「穿越」的时间
  const ms = new Date() - start;
  // (6) 返回 this.body
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async function (ctx, next) {
  // (2) 进入 logger 中间件
  const start = new Date();
  await next();
  // (4) 再次进入 logger 中间件，记录2次通过此中间件「穿越」的时间
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response
app.use(ctx => {
  // (3) 进入 response 中间件
  ctx.body = 'Hello World';
});

app.listen(3000);
```

也许刚从 Express 过来的同学会一脸懵逼，实际上我们可以把它想象成这样的一个流程（类似 LESS 代码）：

```less
.x-response-time {
  // (1) do some stuff
  .logger {
    // (2) do some other stuff
    .response {
      // (3) NO next yield !
      // this.body = 'hello world'
    }
    // (4) do some other stuff later
  }
  // (5) do some stuff lastest and return
}
```

这便是 Koa 中间件的一大特色了。另一点也能在例子中找到：即 Koa 支持 `async` 以及 `await` 语法，可以在中间件中进行任意方式的使用（比如 await mongoose 操作），这样对比起来 Express 其优点就十分明显了。

## 常用的中间件

* [koa-bodyparser](https://www.npmjs.com/package/koa-bodyparser)
* [koa-favicon](https://www.npmjs.com/package/koa-favicon)
* [koa-helmet](https://www.npmjs.com/package/koa-helmet)
* [koa-lusca](https://www.npmjs.com/package/koa-lusca)
* [koa-morgan](https://www.npmjs.com/package/koa-morgan)
* [koa-multer](https://www.npmjs.com/package/koa-multer)
* [koa-passport](https://www.npmjs.com/package/koa-passport)
* [koa-router](https://www.npmjs.com/package/koa-router)
* [koa-session](https://www.npmjs.com/package/koa-session)
* [koa-static-cache](https://www.npmjs.com/package/koa-static-cache)

（等等）

## 错误处理

除非 `app.silent` 被设置为 `true`，否则所有 error 都会被输出到 `stderr`，并且默认的 error handler 不会输出 `err.status === 404 || err.expose === true` 的错误。可以自定义「错误事件」来监听 Koa app 中发生的错误，比如一个简单的例子：记录错误日志

```javascript
app.on('error', err =>
  log.error('server error', err)
);
```

## 应用上下文

Koa 的上下文（Context）将 request 与 response 对象封装至一个对象中，并提供了一些帮助开发者编写业务逻辑的方法。

每个 request 会创建一个 Context，并且向中间件中传引用值。

```javascript
app.use(async (ctx, next) => {
  ctx; // is the Context
  ctx.request; // is a koa Request
  ctx.response; // is a koa Response
});
```

**需要注意的是，挂载在 Context 对象上的并不是 Node.js 原生的 Response 和 Request 对象，而是经过 Koa 封装过的。Koa 提供另外的方法来访问原生对象，但是并不建议这么做！**

为了使用方便，许多上下文属性和方法都被委托代理到他们的 `ctx.request` 或 `ctx.response`，比如访问 `ctx.type` 和 `ctx.length` 将被代理到 `response` 对象，`ctx.path` 和 `ctx.method` 将被代理到 `request` 对象。
