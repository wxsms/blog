---
id: 'koa-js-art-of-code'
title: '代码的艺术：koa 源码精读'
date: 2019-04-04T07:59:02.408Z
tags: [JavaScript, Koa]
index: true
draft: false
---

Node.js 界大名鼎鼎的 [koa](https://github.com/koajs/koa)，不需要多废话了，用了无数次，今天来拜读一下它的源码。

Koa 并不是 Node.js 的拓展，它只是在 Node.js 的基础上实现了以下内容：

* 中间件式的 HTTP 服务框架 （与 Express 一致）
* 洋葱模型 （与 Express 不同）

一统天下级别的框架，只包含了约 500 行源代码。极致强大，极致简单。大概这就是码农与码神的区别，真正的代码的艺术吧。

<!-- more -->

源码结构如下：

```
lib
├── application.js
├── context.js
├── request.js
└── response.js
```

一共就这四个文件（当然，还包含了发布在 npm 上面的其它 package，后面会说到），一目了然。

1. `application.js` 是应用的入口，也就是 `require('koa')` 所得到的东西。它是一个继承自 [events](https://nodejs.org/dist/latest-v11.x/docs/api/events.html) 的 Class
2. `context.js` 就是对应每一个 req / res 的 ctx
3. `request.js` / `response.js` 就不用说了

下面从最基础的看起。

## request.js & response.js

这两个文件的内容非常简单。

### request.js

`request.js` 大概的样子如下：

```javascript
// request.js
module.exports = {
  get header() {
    return this.req.headers;
  },
  set header(val) {
    this.req.headers = val;
  },
  get headers() {
    return this.req.headers;
  },
  set headers(val) {
    this.req.headers = val;
  },
  // 其它 getter & setter......
}
```

这里的 `this.req` 实际上是 [http.IncomingMessage](https://nodejs.org/dist/latest-v11.x/docs/api/http.html)，创建的时候传入的，后面会提到。

这个文件绝大多数是 helper 方法，把本来已经存在在 `http.IncomingMessage` 中的属性通过更方便的方式（`getter` / `setter`）来存取，以达到通过同一个属性来读写的目的。比如想要获取一个 request 的 header 时，通过 `ctx.request.heder`，而想写入 header 时，可以通过 `ctx.request.heder = xxx` 来实现。这也是 koa 的友好特性之一。

其中有一个特殊的是 `ip`：

```javascript
// request.js
const IP = Symbol('context#ip');

module.exports = {
  // ...
  get ip() {
    if (!this[IP]) {
      this[IP] = this.ips[0] || this.socket.remoteAddress || '';
    }
    return this[IP];
  },
  set ip(_ip) {
    this[IP] = _ip;
  },
  // ...
}
```

`Symbol('context#ip')` 是 `request` 对象唯一一个来自自身的 key，我猜测它的目的是：

1. 允许开发者对真实请求 ip 进行改写
2. 同时利用 Symbol 不等于任何值的特性，使它成为私有属性，对外不可见，只可通过 getter 获取

### response.js

`response.js` 与 `request.js` 类似，不同之处在于，`response.js` 重点更多在 `setter` 上面，很好理解，因为 response 的重点是一个服务器向用户返回内容的过程。

koa 的一大特性是在于，只需要向 `ctx.response.body` 赋值就能完成一次请求响应。代码：

```javascript
module.exports = {
  // ...
  get body() {
    return this._body;
  },
  set body(val) {
    const original = this._body;
    this._body = val;

    // no content
    if (null == val) {
      if (!statuses.empty[this.status]) this.status = 204;
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // set the status
    if (!this._explicitStatus) this.status = 200;

    // set the content-type only if not yet set
    const setType = !this.header['content-type'];

    // string
    if ('string' == typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // stream
    if ('function' == typeof val.pipe) {
      onFinish(this.res, destroy.bind(null, val));
      ensureErrorHandler(val, err => this.ctx.onerror(err));

      // overwriting
      if (null != original && original != val) this.remove('Content-Length');

      if (setType) this.type = 'bin';
      return;
    }

    // json
    this.remove('Content-Length');
    this.type = 'json';
  },
  // ...
}
```

可以看到，在 body 的 setter 里面，分别对传入的值为 null / string / buffer / stream / json 的情况进行了处理，并完成了向客户端返回的其它逻辑（设置各种响应头以及状态码），以达到上述目的。

为了达到「至简」目的，koa 对外暴露的 API 基本都是通过 getter / setter 的方式实现的，值得借鉴。

## context.js

Context 「上下文」（通常简写为 ctx）是 koa 的核心之一，它代表了一次用户请求，每个请求都对应着一个独立的 context，实际上它就是 `request` 与 `response` 的结合体，通过「委托模式」实现。它的作用是，开发者对于每一个请求，只需要拿到它的 ctx，就能获取到所有请求的相关信息，亦能做出任何形式的响应。

它的核心代码如下：

```javascript
'use strict';
const delegate = require('delegates');
const Cookies = require('cookies');

const COOKIES = Symbol('context#cookies');

const proto = module.exports = {
  // ...
  get cookies() {
    if (!this[COOKIES]) {
      this[COOKIES] = new Cookies(this.req, this.res, {
        keys: this.app.keys,
        secure: this.request.secure
      });
    }
    return this[COOKIES];
  },
  set cookies(_cookies) {
    this[COOKIES] = _cookies;
  }
};

delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable');

delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .access('accept')
  .getter('origin')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip');
```

可以看到里面的主要内容有：

1. 实现 Cookies 的 getter / setter（因为 koa 把 req 和 res 的 cookies 结合在一起了，所以它须要在 ctx 内实现）
2. 将 request / response 的逻辑代理到 ctx 上面

关于这个「委托模式」的具体实现，TJ 把它放到了一个独立的 NPM Package [delegates](https://github.com/tj/node-delegates) 中。它的功能是：将一个类的子类中的方法与属性，暴露到父类中去，而暴露在父类上的方法可以看做真实方法的「代理」。koa 使用了其中的三种模式，分别是：

1. `method` 代理方法
2. `access` 代理 getter 与 setter
3. `getter` 仅代理 getter

其主要源码：

```javascript
module.exports = Delegator;

function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
  this.getters = [];
  this.setters = [];
  this.fluents = [];
}

Delegator.prototype.method = function(name){
  var proto = this.proto;
  var target = this.target;
  this.methods.push(name);

  proto[name] = function(){
    return this[target][name].apply(this[target], arguments);
  };

  return this;
};

Delegator.prototype.access = function(name){
  return this.getter(name).setter(name);
};

Delegator.prototype.getter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.getters.push(name);

  proto.__defineGetter__(name, function(){
    return this[target][name];
  });

  return this;
};

Delegator.prototype.setter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.setters.push(name);

  proto.__defineSetter__(name, function(val){
    return this[target][name] = val;
  });

  return this;
};
```

依然非常简洁。method 代理使用 `Function.apply` 实现，getter / setter 代理使用 `object.__defineGetter__` 与 `object.__defineSetter__` 实现。

## application.js

去除兼容、校验、实用方法等逻辑，精简过后，该文件的主要内容如下：

```javascript
'use strict';
const onFinished = require('on-finished');
const response = require('./response');
const compose = require('koa-compose');
const context = require('./context');
const request = require('./request');
const Emitter = require('events');
const util = require('util');

/**
 * Expose `Application` class.
 * Inherits from `Emitter.prototype`.
 */

module.exports = class Application extends Emitter {
  
  constructor() {
    super();

    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  callback() {
    const fn = compose(this.middleware);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }

  onerror(err) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
};
```

不到一百行，Koa 主要功能已经全在里面了。

现在可以梳理一下当我们创建一个 koa 服务器的时候，实际上都干了些什么吧：

1. 调用 `constructor`，初始化 ctx / req / res，以及最重要的 `middleware` 数组（不过不理解的是，为什么命名没有加 s 呢？）
2. 对于各种业务场景，调用 `app.use`，这一步只是一个简单的向 `middleware` 数组 push 的过程
3. 调用 `app.listen`，启动 HTTP 服务器
4. 对于每一个进来的请求，调用 `callback` 方法，这个方法做了三件事：
    1. 通过 `koa-compose` 将中间件数组组合为一个「洋葱」模型
    2. 调用 `createContext` 方法，为请求创建 ctx 上下文，同时挂载 req / res
    3. 调用 `handleRequest` 方法，按洋葱模型的顺序执行中间件，并最终返回或报错

这里面最重要的一步就是「洋葱」模型的构建。实际上这个过程也非常简单，以下是 `koa-compose` 的源码（为了精简，已去除校验等逻辑）：

```javascript
function compose (middleware) {
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

它是一个递归：

1. 首先约定，每一个 middleware 都是一个 async 函数（即 Promise），接受两个参数 `ctx` 与 `next`
2. 当 middleware 内部调用 next 函数时，实际上是递归调用了 `dispatch.bind(null, i + 1)` 函数，也就是，将 `index + 1` 的中间件取出来并执行了。因为中间件都是 Promise，所以能够被 await
3. 递归执行步骤 2，直到调用到最后一个 middleware 时，最后被调用的 middleware 会最先结束，然后到上一个，再到上上一个，如此往复就形成了「洋葱」模型
4. 最终所有 middleware 都执行完毕，compose 函数返回 `Promise.resolve()`，即退出递归

「洋葱」模型构建完毕后，`compose` 函数返回一个 Promise，所有 middleware 都已经被有序串联，只需要直接执行该 promise 实例即可。

让人不禁感叹：**大道至简**。

## end

至此，koa 的最主要的功能实现都已过了一遍了。

总结一下它做了的事情：

1. 通过 `getter` / `setter` 方法简化 Node.js HTTP 的使用方式
2. 通过 `ctx` 简化开发者访问 req / res 的方式
3. 通过「洋葱」模型简化 HTTP 请求的处理流程

大概就这样。
